import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { useVideoPlayer, VideoView } from 'expo-video';
import axiosInstance from '../context/urlContext';

const EventShow = () => {
  const route = useRoute();
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();
  const urlDefinitivo = "https://www.w3schools.com/html/mov_bbb.mp4"

  const videoPlayer = useVideoPlayer(); // Crea una instancia del reproductor de video

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get(`events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    fetchAttendances();
  }, [id]);

  const fetchAttendances = async () => {
    try {
      const response = await axiosInstance.get(`events/${id}/attendances`);
      setAttendances(response.data.attendances);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  };

  const handleCheckinEvent = async (eventId) => {
    const userId = currentUser.id;
    const attendanceValues = {
      user_id: userId,
      event_id: eventId,
      checked_in: true,
    };
    try {
      const response = await axiosInstance.post('attendances', { attendance: attendanceValues });
      console.log('Attendance created successfully:', response.data);
      fetchAttendances(); // Refresh attendances
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const handleViewBarClick = (barId) => {
    navigation.navigate('BarShow', { id: barId });
  };

  const handleViewPicturesClick = (eventId) => {
    navigation.navigate('EventPictures', { id: eventId });
  };

  const handlePostPictureClick = (eventId) => {
    navigation.navigate('CreatePicture', { eventId });
  };

  const handleResumeClick = async (eventId) => {
    try {
      const response = await axiosInstance.get(`events/${eventId}/video_exists`);
      console.log('Checking if video exists...', response.data);
      if (response.data.video_exists) {
        setVideoUrl(response.data.video_url);
        setModalVisible(true);
      } else {
        const videoResponse = await axiosInstance.post(`events/${eventId}/create_video`);
        console.log('Creating video...', videoResponse.data);
        if (videoResponse.data.video_created) {
          console.log('Video created successfully:', videoResponse.data.video_url);
          setVideoUrl(videoResponse.data.video_url);
          setModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error handling resume click:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#AF8F6F" />;
  }

  if (!event) {
    return <Text style={styles.message}>Event not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.paper}>
        <View style={styles.box}>
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.subtitle}>{event.description}</Text>
          <Text style={styles.subtitle}>{new Date(event.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.buttonContainer}>
          {new Date() < new Date(event.date) && !attendances.some(attendance => attendance.user_id === currentUser.id) && (
            <TouchableOpacity style={styles.button} onPress={() => handleCheckinEvent(event.id)}>
              <Text style={styles.buttonText}>Check In</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={() => handleViewBarClick(event.bar_id)}>
            <Text style={styles.buttonText}>View Bar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleViewPicturesClick(event.id)}>
            <Text style={styles.buttonText}>Picture Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePostPictureClick(event.id)}>
            <Text style={styles.buttonText}>Post Picture</Text>
          </TouchableOpacity>
        </View>
        {new Date() > new Date(event.date) && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleResumeClick(event.id)}>
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.paper}>
        <View style={styles.box}>
          <Text style={styles.title}>Attendance</Text>
          {attendances.length > 0 ? (
            attendances.map(attendance => (
              <View key={attendance.id} style={styles.attendanceBox}>
                <Text style={styles.attendanceText}>{attendance.user.name} | {attendance.user.first_name} {attendance.user.last_name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.message}>No attendances found.</Text>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalView}>
          <View style={styles.videoContainer}>
            <VideoView
              player={videoPlayer}
              style={styles.video}
              allowsFullscreen
              allowsPictureInPicture
            />
            {videoPlayer.source !== videoUrl && videoPlayer.replace(videoUrl)}
          </View>
          <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F4E1',
  },
  paper: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  box: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Belwe',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Belwe',
  },
  attendanceBox: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
  },
  attendanceText: {
    fontSize: 14,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoContainer: {
    width: '90%',  // Ajusta el ancho para dejar margen
    height: 300,
    backgroundColor: '#fff',  // Marco blanco
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,  // Espacio entre el video y el borde blanco
    borderRadius: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
});

export default EventShow;