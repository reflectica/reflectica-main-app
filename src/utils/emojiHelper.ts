type Rating = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

const emojiRatings: Record<Rating, string> = {
  '1': '😞',
  '2': '😟',
  '3': '😕',
  '4': '😐',
  '5': '🙂',
  '6': '😊',
  '7': '😀',
  '8': '😁',
  '9': '😆',
  '10': '😂',
};

export const getEmojiByRating = (rating: number): string | undefined => {
  return emojiRatings[rating.toString() as Rating];
};
