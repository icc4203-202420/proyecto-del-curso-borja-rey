import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../context/urlContext';
import { UserContext } from '../context/UserContext';

const TagSchema = yup.object({
  user_id: yup.number().required('User is required'),
});

function PictureShow() {
  const route = useRoute();
  const { id } = route.params;
  const [picture, setPicture] = useState({});
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  const handleViewProfileClick = (userId) => {
    navigation.navigate('UserShow', { id: userId });
  };

  const fetchTags = async () => {
    try {
      const response = await axiosInstance.get(`event_pictures/${id}`);
      const data = response.data;
      setTags(data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    const fetchPicture = async () => {
      try {
        const response = await axiosInstance.get(`event_pictures/${id}`);
        const data = response.data;
        console.log("Data: ", data);
        console.log('Picture: ', data.picture);
        setPicture(data.event_picture);
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching pictures:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('users');
        const data = response.data;
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchTags();
    fetchUsers();
    fetchPicture();
  }, [id]);

  const handleSearch = () => {
    setFilteredUsers(
      users.filter(user => user.handle.toLowerCase().includes(searchText.toLowerCase())).slice(0, 3)
    );
    setIsDropdownVisible(true);
  };

  return (
    currentUser ? (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.paper}>
          <Text style={styles.title}>Picture</Text>
          <View style={styles.pictureContainer}>
            <Image
              source={{ uri: picture.picture_url }}
              style={styles.picture}
            />
            <Text style={styles.description}>{user.handle}: {picture.description}</Text>
          </View>
          <View style={styles.tagsContainer}>
            <Text style={styles.subtitle}>Tags</Text>
            <Formik
              initialValues={{
                user_id: ''
              }}
              validationSchema={TagSchema}
              onSubmit={(values, { setSubmitting }) => {
                const tagValues = {
                  event_picture_id: picture.id,
                  tagged_user_id: values.user_id,
                  tagged_by_id: currentUser.id
                };
                axiosInstance.post('tags', { tag: tagValues })
                  .then(response => {
                    console.log('Tag created successfully:', response.data);
                    setSubmitting(false);
                    fetchTags(); // Actualizar la lista de etiquetas
                  })
                  .catch(error => {
                    console.error('Error creating tag:', error);
                    setSubmitting(false);
                  });
              }}
            >
              {({ handleSubmit, setFieldValue, isSubmitting }) => (
                <View style={styles.form}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search user by handle"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                  {isDropdownVisible && filteredUsers.length > 0 && (
                    <View style={styles.dropdown}>
                      {filteredUsers.map(user => (
                        <TouchableOpacity
                          key={user.id}
                          onPress={() => {
                            setFieldValue('user_id', user.id);
                            setSearchText(user.handle);
                            setFilteredUsers([]);
                            setIsDropdownVisible(false);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text>{user.handle}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.searchButton}
                      onPress={handleSearch}
                    >
                      <Text style={styles.buttonText}>Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.buttonText}>Tag</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
            {tags.length > 0 ? (
              tags.map(tag => (
                <View key={tag.id} style={styles.tag}>
                  <Text style={styles.tagText}>
                    <Text style={styles.boldText}>{tag.tagged_by.handle}</Text>: {tag.tagged_user.handle}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewProfileClick(tag.tagged_user.id)}
                  >
                    <Text style={styles.buttonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No Tags found.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    ) : (
      <View style={styles.errorContainer}>
        <Image
          source={require('../../assets/beerLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.errorText}>Error 401</Text>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F4E1',
  },
  paper: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Belwe',
    marginBottom: 16,
  },
  pictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  picture: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Belwe',
    textAlign: 'center',
  },
  tagsContainer: {
    marginTop: 16,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Belwe',
    marginBottom: 8,
  },
  form: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  dropdown: {
    width: '100%',
    maxHeight: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Belwe',
  },
  searchButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  tag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 16,
    fontFamily: 'Belwe',
  },
  boldText: {
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#AF8F6F',
    padding: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Belwe',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
  },
  errorText: {
    fontSize: 32,
    fontFamily: 'Belwe',
    color: '#000',
  },
});

export default PictureShow;