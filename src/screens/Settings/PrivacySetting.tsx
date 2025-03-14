import * as React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const PrivacySetting = () => {
  return (
    <View style={styles.privacyterms}>
      <View style={styles.header}>
        <Text style={styles.privacyTerms}>{`Privacy & Terms`}</Text>
      </View>
      <Text style={[styles.termsConditions, styles.termsConditionsTypo]}>{`terms & conditions`}</Text>
      <Text style={[styles.lastUpdate, styles.termsConditionsTypo]}>last update: 1/31/2025</Text>
      <Text style={[styles.loremIpsumDolor, styles.utLaciniaJustoTypo]}>{`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem, vel tincidunt tortor placerat a. Proin ac diam quam. Aenean in sagittis magna, ut feugiat diam. Fusce a scelerisque neque, sed accumsan metus.

Nunc auctor tortor in dolor luctus, quis euismod urna tincidunt. Aenean arcu metus, bibendum at rhoncus at, volutpat ut lacus. Morbi pellentesque malesuada eros semper ultrices. Vestibulum lobortis enim vel neque auctor, a ultrices ex placerat. Mauris ut lacinia justo, sed suscipit tortor. Nam egestas nulla posuere neque tincidunt porta.`}</Text>
      <Text style={[styles.utLaciniaJusto, styles.utLaciniaJustoTypo]}>{`Ut lacinia justo sit amet lorem sodales accumsan. Proin malesuada eleifend fermentum. Donec condimentum, nunc at rhoncus faucibus, ex nisi laoreet ipsum, eu pharetra eros est vitae orci. Morbi quis rhoncus mi. Nullam lacinia ornare accumsan. Duis laoreet, ex eget rutrum pharetra, lectus nisl posuere risus, vel facilisis nisi tellus ac turpis.
Ut lacinia justo sit amet lorem sodales accumsan. Proin malesuada eleifend fermentum. Donec condimentum, nunc at rhoncus faucibus, ex nisi laoreet ipsum, eu pharetra eros est vitae orci. Morbi quis rhoncus mi. Nullam lacinia ornare accumsan. Duis laoreet, ex eget rutrum pharetra, lectus nisl posuere risus, vel facilisis nisi tellus. 
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem, vel tincidunt tortor placerat a. Proin ac diam quam. Aenean in sagittis magna, ut feugiat diam.
Nunc auctor tortor in dolor luctus, quis euismod urna tincidunt. Aenean arcu metus, bibendum at rhoncus at, volutpat ut lacus....`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  privacyterms: {
    backgroundColor: "#f5f7fa",
    flex: 1,
    height: 812,
    overflow: "hidden",
    width: "100%",
  },
  header: {
    top: 58,
    left: 31,
    height: 30,
    width: 314,
    position: "absolute",
  },
  privacyTerms: {
    fontSize: 25,
    fontWeight: "700",
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "#000",
    left: 0,
    top: 0,
    width: 314,
    position: "absolute",
  },
  termsConditionsTypo: {
    textAlign: "left",
    color: "#5271ff",
    fontFamily: "Mukta-SemiBold",
    textTransform: "capitalize",
    left: 20,
    fontWeight: "600",
    fontSize: 16,
    position: "absolute",
  },
  utLaciniaJustoTypo: {
    fontFamily: "LeagueSpartan-ExtraLight",
    fontWeight: "200",
    fontSize: 14,
    textAlign: "left",
    color: "#000",
    position: "absolute",
  },
  termsConditions: {
    top: 334,
    width: 168,
    height: 23,
    marginTop: 10,
  },
  lastUpdate: {
    top: 118,
    display: "flex",
    alignItems: "center",
    width: 231,
    height: 21,
  },
  loremIpsumDolor: {
    top: 149,
    width: 285,
    height: 185,
    left: 41,
    fontWeight: "200",
    fontSize: 14,
  },
  utLaciniaJusto: {
    top: 377,
    left: 34,
    width: 307,
    height: 394,
  },
});

export default PrivacySetting;