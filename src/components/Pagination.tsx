import { View, StyleSheet } from 'react-native';

interface PaginationProps {
  activeIndex: number;
  length: number;
}

export default function Pagination( { activeIndex, length }: PaginationProps ) {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_: any, i: number) => (
        <View
          key={i}
          style={[styles.dot, i === activeIndex ? styles.activeDot : styles.inactiveDot]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#5271FF',
  },
  inactiveDot: {
    backgroundColor: '#C4C4C4',
  }
})

