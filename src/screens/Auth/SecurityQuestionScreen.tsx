import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSecurityContext, SecurityQuestion} from '../../context/SecurityContext';
import {ButtonTemplate} from '../../components';
import {SecurityQuestionScreenProps} from '../../constants';

const screenWidth = Dimensions.get('window').width;

const predefinedQuestions = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your childhood nickname?",
  "What was the make of your first car?",
  "What is your favorite color?",
  "What was the name of your favorite teacher?",
  "What street did you grow up on?",
  "What was your favorite childhood book?",
];

const SecurityQuestionScreen = ({navigation, route}: SecurityQuestionScreenProps) => {
  const {state, actions} = useSecurityContext();
  const [mode] = useState(route?.params?.mode || 'setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    {id: '1', question: '', answer: ''},
    {id: '2', question: '', answer: ''},
    {id: '3', question: '', answer: ''},
  ]);
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [selectedQuestionForVerification, setSelectedQuestionForVerification] = useState<SecurityQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'verify') {
      loadRandomQuestionForVerification();
    }
  }, [mode]);

  const loadRandomQuestionForVerification = async () => {
    try {
      // In a real implementation, this would load from secure storage
      // For demo purposes, we'll use a sample question
      const sampleQuestion: SecurityQuestion = {
        id: '1',
        question: predefinedQuestions[0],
        answer: 'demo', // This would be the stored answer
      };
      setSelectedQuestionForVerification(sampleQuestion);
    } catch (error) {
      Alert.alert('Error', 'Failed to load security question');
    }
  };

  const handleQuestionSelect = (questionText: string, questionIndex: number) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      question: questionText,
    };
    setSecurityQuestions(updatedQuestions);
  };

  const handleAnswerChange = (answer: string, questionIndex: number) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      answer: answer,
    };
    setSecurityQuestions(updatedQuestions);
  };

  const validateQuestions = (): boolean => {
    for (let i = 0; i < securityQuestions.length; i++) {
      const question = securityQuestions[i];
      if (!question.question.trim() || !question.answer.trim()) {
        Alert.alert('Error', `Please complete question ${i + 1}`);
        return false;
      }
      if (question.answer.trim().length < 2) {
        Alert.alert('Error', `Answer for question ${i + 1} is too short`);
        return false;
      }
    }

    // Check for duplicate questions
    const questions = securityQuestions.map(q => q.question);
    const uniqueQuestions = new Set(questions);
    if (uniqueQuestions.size !== questions.length) {
      Alert.alert('Error', 'Please select different questions for each slot');
      return false;
    }

    return true;
  };

  const handleSaveQuestions = async () => {
    if (!validateQuestions()) return;

    setIsLoading(true);
    try {
      const success = await actions.setupSecurityQuestions(securityQuestions);
      
      if (success) {
        actions.logSecurityEvent({
          type: 'password_change', // Using closest available type
          details: {action: 'security_questions_setup'},
        });
        
        Alert.alert(
          'Success',
          'Security questions have been set up successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (route?.params?.onComplete) {
                  route.params.onComplete();
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save security questions. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving security questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!verificationAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    if (!selectedQuestionForVerification) {
      Alert.alert('Error', 'No question available for verification');
      return;
    }

    setIsLoading(true);
    try {
      const isCorrect = await actions.verifySecurityAnswer(
        selectedQuestionForVerification.id,
        verificationAnswer
      );

      if (isCorrect) {
        Alert.alert(
          'Verification Successful',
          'Your identity has been verified.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (route?.params?.onComplete) {
                  route.params.onComplete();
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Incorrect answer. Please try again.');
        setVerificationAnswer('');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSetupMode = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Set Up Security Questions</Text>
        <Text style={styles.description}>
          Choose 3 security questions and provide answers. These will be used for account recovery
          and additional verification when needed.
        </Text>
      </View>

      {securityQuestions.map((question, index) => (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Question {index + 1}</Text>
          
          <TouchableOpacity
            style={styles.questionSelector}
            onPress={() => {
              Alert.alert(
                'Select a Question',
                'Choose from the predefined questions:',
                predefinedQuestions.map((q, i) => ({
                  text: q,
                  onPress: () => handleQuestionSelect(q, index),
                })).concat([{text: 'Cancel', onPress: () => {}}])
              );
            }}>
            <Text style={[
              styles.questionText,
              !question.question && styles.placeholderText
            ]}>
              {question.question || 'Select a question...'}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Answer</Text>
            <TextInput
              style={styles.textInput}
              value={question.answer}
              onChangeText={(text) => handleAnswerChange(text, index)}
              placeholder="Enter your answer"
              autoCapitalize="words"
              editable={!isLoading && !!question.question}
            />
          </View>
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <ButtonTemplate
          title={isLoading ? "Saving..." : "Save Security Questions"}
          stylebtn="purple"
          action={handleSaveQuestions}
          disabled={isLoading}
        />
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderVerifyMode = () => (
    <View style={styles.verifyContainer}>
      <Text style={styles.title}>Security Question Verification</Text>
      <Text style={styles.description}>
        Please answer the following security question to verify your identity.
      </Text>

      {selectedQuestionForVerification && (
        <View style={styles.verificationQuestionContainer}>
          <Text style={styles.verificationQuestion}>
            {selectedQuestionForVerification.question}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Answer</Text>
            <TextInput
              style={styles.textInput}
              value={verificationAnswer}
              onChangeText={setVerificationAnswer}
              placeholder="Enter your answer"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <ButtonTemplate
          title={isLoading ? "Verifying..." : "Verify Answer"}
          stylebtn="purple"
          action={handleVerifyAnswer}
          disabled={isLoading}
        />
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {mode === 'setup' ? renderSetupMode() : renderVerifyMode()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  verifyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  questionContainer: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5271FF',
    marginBottom: 15,
  },
  questionSelector: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  verificationQuestionContainer: {
    marginVertical: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  verificationQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default SecurityQuestionScreen;