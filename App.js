import React, { Component } from "react"

import {
  AsyncStorage,
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

class App extends Component {
  state = {
    podcasts: undefined,
    subscriptions: [],
    terms: undefined,
  }

  async componentDidMount() {
    const subscriptions = await AsyncStorage.getItem(
      "subscriptions",
    )

    this.setState({
      subscriptions: subscriptions
        ? JSON.parse(subscriptions)
        : [],
    })
  }

  render() {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          padding: 25,
        }}
      >
        <TextInput
          style={{
            width: "100%",
            borderColor: "#e0e0e0",
            borderWidth: 1,
            borderRadius: 4,
            padding: 10,
          }}
          onChange={this.onChangeTerms}
        />
        <Button
          title="Search"
          onPress={this.onPressSearch}
        />
        {this.renderPodcasts()}
      </View>
    )
  }

  onChangeTerms = e => {
    this.setState({ terms: e.nativeEvent.text })
  }

  onPressSearch = async () => {
    const { terms } = this.state

    const uri = `https://itunes.apple.com/search?media=podcast&term=${terms}`

    const result = await fetch(uri)
    const json = await result.json()

    this.setState({
      podcasts: json.results,
    })
  }

  renderPodcasts = () => {
    const { podcasts, subscriptions } = this.state

    if (podcasts === undefined) {
      return null
    }

    if (podcasts.length < 1) {
      return (
        <View>
          <Text>
            There are no podcasts matching these terms
          </Text>
        </View>
      )
    }

    const subscriptionIds = subscriptions.map(
      podcast => podcast.collectionId,
    )

    return (
      <ScrollView
        style={{
          flexGrow: 0,
          width: "100%",
          height: "50%",
        }}
      >
        {podcasts.map(podcast =>
          this.renderPodcast(
            podcast,
            subscriptionIds.includes(podcast.collectionId),
          ),
        )}
      </ScrollView>
    )
  }

  renderPodcast = (podcast, isSubscribed) => {
    return (
      <TouchableOpacity
        key={podcast.collectionId}
        onPress={() => {
          if (isSubscribed) {
            return
          }

          this.onPressAvailablePodcast(podcast)
        }}
      >
        <View
          style={{
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <Text
            style={{
              color: isSubscribed ? "#e0e0e0" : "#007afb",
              fontSize: 18,
            }}
          >
            {podcast.collectionName}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  onPressAvailablePodcast = async podcast => {
    const { subscriptions: previous } = this.state

    const subscriptions = [...previous, podcast]

    this.setState({
      subscriptions,
    })

    await AsyncStorage.setItem(
      "subscriptions",
      JSON.stringify(subscriptions),
    )
  }
}

export default App
