import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';

const initialState = {
  reviews: [],
  rating: 0,
  userReview: null,
  loading: true,
  error: null,
};

function reviewsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_REVIEWS_SUCCESS':
      const rate = action.payload.reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0) / action.payload.reviews.length;
      const userReview = action.payload.reviews.find(review => review.user_id === action.payload.currentUser?.id);
      return {
        ...state,
        reviews: action.payload.reviews,
        rating: rate,
        userReview: userReview,
        loading: false,
      };
    case 'FETCH_REVIEWS_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}

function BeerShow() {
  const route = useRoute();
  const { id, refresh } = route.params;
  const [beer, setBeer] = useState(null);
  const [bars, setBars] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const { currentUser } = useContext(UserContext); // Obtén currentUser desde UserContext

  const [state, dispatch] = useReducer(reviewsReducer, initialState);
  const { reviews, rating, userReview, loading, error } = state;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBeer = async () => {
      try {
        const response = await axiosInstance.get(`beers/${id}`);
        setBeer(response.data);
      } catch (error) {
        console.error('Error fetching beer:', error);
      }
    };

    const fetchBars = async () => {
      try {
        const response = await axiosInstance.get(`beers/${id}/bars`);
        setBars(response.data.bars || []);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    const fetchBreweries = async () => {
      try {
        const response = await axiosInstance.get(`beers/${id}/breweries`);
        setBreweries(response.data.breweries || []);
      } catch (error) {
        console.error('Error fetching breweries:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`beers/${id}/reviews`);
        dispatch({ type: 'FETCH_REVIEWS_SUCCESS', payload: { reviews: response.data.reviews || [], currentUser } });
      } catch (error) {
        dispatch({ type: 'FETCH_REVIEWS_ERROR', payload: error });
        console.error('Error fetching reviews:', error);
      }
    };

    fetchBeer();
    fetchBars();
    fetchBreweries();
    fetchReviews();
  }, [id, currentUser]);

  const handleViewBarClick = (id) => {
    navigation.navigate('BarDetails', { id });
  };

  const handleViewReviewsClick = (id) => {
    AsyncStorage.setItem("beer", id.toString());
    navigation.navigate('BeerReviews', { id });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchBeer = async () => {
        try {
          const response = await axiosInstance.get(`beers/${id}`);
          setBeer(response.data);
        } catch (error) {
          console.error('Error fetching beer:', error);
        }
      };

      const fetchBars = async () => {
        try {
          const response = await axiosInstance.get(`beers/${id}/bars`);
          setBars(response.data.bars || []);
        } catch (error) {
          console.error('Error fetching bars:', error);
        }
      };

      const fetchReviews = async () => {
        try {
          const response = await axiosInstance.get(`beers/${id}/reviews`);
          dispatch({ type: 'FETCH_REVIEWS_SUCCESS', payload: { reviews: response.data.reviews || [], currentUser } });
        } catch (error) {
          dispatch({ type: 'FETCH_REVIEWS_ERROR', payload: error });
          console.error('Error fetching reviews:', error);
        }
      };

      fetchBeer();
      fetchBars();
      fetchReviews();
    }, [refresh, currentUser])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#AF8F6F" />;
  }

  if (!beer) {
    return <Text style={styles.message}>Beer not found.</Text>;
  }

  return (
    currentUser ? (
      <ScrollView
          style={{ flex: 1 }} // Asegura que el ScrollView ocupe todo el espacio disponible
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={true}
        >
        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>{beer.name}</Text>
            <Text style={styles.subtitle}>Brewery: {beer.brewery || 'N/A'} | Rating: {rating.toFixed(2)}</Text>
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
                <Text style={styles.reviewText}>Rate: {userReview.rating} - {userReview.text}</Text>
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
                  <TouchableOpacity style={styles.buttonViewBar} onPress={() => handleViewBarClick(bar.id)}>
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
            <Text style={styles.title}>Breweries</Text>
            {breweries.length > 0 ? (
              breweries.map(brewery => (
                <View key={brewery.id} style={styles.barBox}>
                  <Text style={styles.barText}>{brewery.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No breweries found.</Text>
            )}
          </View>
        </View>

        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>Reviews</Text>
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <View key={review.id} style={styles.reviewBox}>
                  <Text style={styles.reviewText}>{i + 1}. Rate: {review.rating} - {review.text}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No reviews found.</Text>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F4E1',
    flexGrow: 1, // Asegura que el ScrollView crezca si hay más contenido
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
    marginBottom:1,
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
  buttonViewBar: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
    alignSelf: 'flex-end', // Alinea el botón a la derecha
    width: 'auto', // Permite que el ancho se ajuste automáticamente al contenido
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
    marginBottom: 5,
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