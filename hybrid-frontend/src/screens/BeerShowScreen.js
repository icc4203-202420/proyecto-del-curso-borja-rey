import React, { useState, useEffect, useCallback } from 'react'; // Añadir useCallback
import { View, Text, Image, Button, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'; // Añadir useFocusEffect
import { IP_BACKEND } from '@env';

function BeerShow() {
  const route = useRoute();
  const { id, refresh } = route.params;
  const [beer, setBeer] = useState(null);
  const [bars, setBars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await AsyncStorage.getItem('current_user');
      setCurrentUser(JSON.parse(user));
    };

    const fetchBeer = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/beers/${id}`);
        const data = await response.json();
        setBeer(data);
      } catch (error) {
        console.error('Error fetching beer:', error);
      }
    };

    const fetchBars = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/beers/${id}/bars`);
        const data = await response.json();
        setBars(data.bars || []);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/beers/${id}/reviews`);
        const data = await response.json();
        setReviews(data.reviews || []);
        const rate = data.reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0) / data.reviews.length;
        const userReview = data.reviews.find(review => review.user_id === currentUser?.id);
        setUserReview(userReview);
        setRating(rate);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchCurrentUser();
    fetchBeer();
    fetchBars();
    fetchReviews();
    setLoading(false);
  }, [id]);

  const handleViewBarClick = (id) => {
    navigation.navigate('BarDetails', { id });
  };

  const handleViewReviewsClick = (id) => {
    AsyncStorage.setItem("beer", id.toString());
    navigation.navigate('BeerReviews', { id });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchCurrentUser = async () => {
        const user = await AsyncStorage.getItem('current_user');
        setCurrentUser(JSON.parse(user));
      };

      const fetchBeer = async () => {
        try {
          const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/beers/${id}`);
          const data = await response.json();
          setBeer(data);
        } catch (error) {
          console.error('Error fetching beer:', error);
        }
      };

      const fetchBars = async () => {
        try {
          const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/beers/${id}/bars`);
          const data = await response.json();
          setBars(data.bars || []);
        } catch (error) {
          console.error('Error fetching bars:', error);
        }
      };

      const fetchReviews = async () => {
        try {
          const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/beers/${id}/reviews`);
          const data = await response.json();
          setReviews(data.reviews || []);
          const rate = data.reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0) / data.reviews.length;
          const userReview = data.reviews.find(review => review.user_id === currentUser?.id);
          setUserReview(userReview);
          setRating(rate);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      };

      fetchCurrentUser();
      fetchBeer();
      fetchBars();
      fetchReviews();
    }, [refresh])  // Add 'refresh' as a dependency
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#AF8F6F" />;
  }

  if (!beer) {
    return <Text style={styles.message}>Beer not found.</Text>;
  }

  return (
    currentUser ? (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>{beer.name}</Text>
            <Text style={styles.subtitle}>{beer.brewery || 'N/A'} | Rating: {rating.toFixed(2)}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: beer.image_url || "https://via.placeholder.com/400" }}
              style={styles.image}
            />
          </View>
          <View style={styles.box}>
            <Text style={styles.description}>{beer.description || 'No description available.'}</Text>
            <Text style={styles.description}>Alcohol: {beer.alcohol} | IBU: {beer.ibu}</Text>
            <Text style={styles.description}>Malts: {beer.malts} | Hop: {beer.hop} | Yeast: {beer.yeast}</Text>
            <Text style={styles.description}>Brand: {beer.brand.name} | Brewery: {beer.brand.brewery.name}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => console.log('Favorite clicked')}>
              <Text style={styles.buttonText}>Favorite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleViewReviewsClick(beer.id)}>
              <Text style={styles.buttonText}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {userReview && (
          <View style={styles.paper}>
            <View style={styles.box}>
              <Text style={styles.title}>Your Review</Text>
              <View style={styles.reviewBox}>
                <Text style={styles.reviewText}>Rate: {userReview.rating}; {userReview.text}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>Where to drink?</Text>
            {bars.length > 0 ? (
              bars.map(bar => (
                <View key={bar.id} style={styles.barBox}>
                  <Text style={styles.barText}>{bar.name}</Text>
                  <TouchableOpacity style={styles.button} onPress={() => handleViewBarClick(bar.id)}>
                    <Text style={styles.buttonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No bars found.</Text>
            )}
          </View>
        </View>

        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>Reviews</Text>
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <View key={review.id} style={styles.reviewBox}>
                  <Text style={styles.reviewText}>{i + 1}. Rate: {review.rating}; {review.text}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No reviews found.</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleViewReviewsClick(beer.id)}>
            <Text style={styles.buttonText}>Add a Review</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  paper: {
    flex: 1,
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  reviewBox: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  reviewText: {
    fontSize: 14,
  },
  barBox: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barText: {
    fontSize: 14,
  },
  message: {
    fontSize: 16,
    color: '#666',
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

export default BeerShow;