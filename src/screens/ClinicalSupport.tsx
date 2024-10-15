import React from 'react';
import {Text, StyleSheet, Dimensions, View, TextInput, ScrollView, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ButtonTemplate} from '../components';

const screenHeight = Dimensions.get('window').height as number;
const screenWidth = Dimensions.get('window').width as number;

export default function ClinicalSupport() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Clinical Support</Text>

       {/* Profile picture, welcome text, username, and bell icon */}
       <View style={styles.profileContainer}>
        <Image
          source={require('../assets/ClinicalSupport/profilepic.jpg')}  // Replace with actual image URL
          style={styles.profilePic}
        />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome To Clinical Support</Text>
          <Text style={styles.profileName}>(Patient Name)</Text>
        </View>
        <Image
          source={require('../assets/ClinicalSupport/bell.png')}  // Replace with actual icon URL
          style={styles.bellIcon}
        />
      </View>

       {/* Search bar with an icon */}
       <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
        />
        <Image
          source={require('../assets/ClinicalSupport/search-icon.png')}  // Replace with your icon path
          style={styles.searchIcon}
        />
      </View>

      {/* Scroll view for different doctors, each doctor should have its own rectangle */}

        {/* View Text heading followed by 3 bullet points below */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Analytics Insights</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Consulted Dr. Smith for cardiovascular health.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Scheduled a follow-up for next week.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Updated health records for annual check-up.</Text>
          </View>
        </View>

        {/* View Text heading followed by 3 bullet points below */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Key Goals in Recommendations</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Consulted Dr. Smith for cardiovascular health.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Scheduled a follow-up for next week.</Text>
          </View>
        </View>

        <View style={styles.doctorCard}>
          <Image source={require('../assets/ClinicalSupport/doctorheadshot.jpg')} style={styles.doctorPic} />
          <View style={{paddingLeft: 15}}>
            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Stevin Martin, M.D.</Text>
                <Text style={styles.doctorSpecialty}>Specializes in general social anxiety</Text>
            </View>
            <View style={{flexDirection:"row"}}>
                <View style={styles.doctorRating}>
                    <Image source={require('../assets/ClinicalSupport/star.png')} style={styles.starIcon} />
                    <Text style={styles.ratingText}>4.5</Text>
                </View>
                <View style={styles.doctorFavorite}>
                    <Image source={require('../assets/ClinicalSupport/heart.png')} style={styles.heartIcon} />
                </View>
            </View>
          </View>
        </View>

        <View style={styles.doctorCard}>
          <Image source={require('../assets/ClinicalSupport/doctorheadshot2.png')} style={styles.doctorPic} />
          <View style={{paddingLeft: 15}}>
            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Sarah Edwards, M.D.</Text>
                <Text style={styles.doctorSpecialty}>Specializes in relationship & familial issues</Text>
            </View>
            <View style={{flexDirection:"row"}}>
                <View style={styles.doctorRating}>
                    <Image source={require('../assets/ClinicalSupport/star.png')} style={styles.starIcon} />
                    <Text style={styles.ratingText}>4.2</Text>
                </View>
                <View style={styles.doctorFavorite}>
                    <Image source={require('../assets/ClinicalSupport/heart.png')} style={styles.heartIcon} />
                </View>
            </View>
          </View>
        </View>
        
      {/* Button for recommendations */}
      <ButtonTemplate
        title="See All Recommendations"
        stylebtn={'purple'}
        action={() => {}}
        styling={styles.recommendationsButton}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F7FA',
    flex: 1,
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Montserrat',
    fontWeight: '700',
    fontSize: 25,
    lineHeight: 30.48,
    textAlign: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // This will push the bell icon to the far right
    width: screenWidth * 0.9,
    padding: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,  // This makes the image circular
    marginRight: 10,  // Adds some spacing between the image and the text
  },
  welcomeContainer: {
    flexDirection: 'column',  // Stack the welcome text and name vertically
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2260FF',  // Slightly lighter color for the welcome text
  },
  profileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',  // Darker color for the name
  },
  bellIcon: {
    width: 35,
    height: 35,
  },
  searchBarContainer: {
    position: 'relative',
    width: screenWidth * 0.9,
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: '#CAD6FF',
    borderRadius: 25,
    padding: 10,
    paddingRight: 40,  // Add some padding to the right for the icon
  },
  searchIcon: {
    position: 'absolute',
    right: 15,  // Position the icon on the far right inside the search bar
    height: 20,
    width: 20,
  },
  section: {
    width: screenWidth * 0.9,
    marginVertical: 10,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bullet: {
    fontSize: 20,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 16,
  },
  recommendationBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
  },
  recommendationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  doctorCard: {
    backgroundColor: '#CAD6FF',
    width: screenWidth * 0.8,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
  },
  doctorPic: {
    width: 65,
    height: 65,
    borderRadius: 40,
  },
  doctorInfo:{
    backgroundColor: '#FFFFFF',
    width: screenWidth * 0.56,
    borderRadius: 17,
    alignItems: 'flex-start',
    paddingLeft: 15,
    marginBottom: 5,
    paddingBottom: 5,
  },
  doctorName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    color: '#2260FF',
    lineHeight: 20,
  },
  doctorSpecialty: {
    fontSize: 10,
    color: '#000000',
  },
  doctorRating: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 20,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',  // Vertically center the image and text
    justifyContent: 'center',  // Horizontally center both items
    fontSize: 15,
    color: '#2260FF',
    paddingHorizontal: 5,  // Add some horizontal padding for a neat look
  },
  starIcon: {
    height: 15,
    width: 15,
    marginRight: 5,  // Add spacing between the star icon and the rating
  },
  ratingText: {
    fontSize: 12,
    color: '#2260FF',
  },
  doctorFavorite: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  heartIcon: {
    height: 12,
    width: 15,
  },
  recommendationsButton: {
    width: screenWidth * 0.9,
    marginVertical: 0,
  },
});
