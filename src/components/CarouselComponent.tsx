import { ImageSourcePropType, View, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

type ItemProps = {
    image: ImageSourcePropType;
    title: string;
    description: string;
};

interface CarouselComponentProps {
    renderItemContainerStyle: Object;
    renderImageStyle: Object;
    items: ItemProps[];
    width: number;
    height: number;
    loop: boolean;
    onSnapToItem: (index: number) => void;
}

export default function CarouselComponent({items, width, height, loop, onSnapToItem, renderItemContainerStyle, renderImageStyle}: CarouselComponentProps) {
    const renderItem = ({ item }: { item: ItemProps }) => (
        <View style={renderItemContainerStyle}>
          <Image source={item.image} style={[renderImageStyle, { width, height }]} />
        </View>
    );

    return (
        <Carousel
            data={items}
            renderItem={renderItem}
            width={width}
            height={height}
            mode="parallax"
            modeConfig={{
                parallaxScrollingScale: .75,
                parallaxScrollingOffset: 110,
            }}
            loop={loop}
            onSnapToItem={onSnapToItem}
        />
    )
}
