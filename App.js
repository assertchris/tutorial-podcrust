import React, { Component } from "react"

import {
  AsyncStorage,
  Button,
  Image,
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
    tab: "search",
  }

  async componentDidMount() {
    const subscriptions = await AsyncStorage.getItem(
      "subscriptions",
    )

    const parsed = subscriptions
      ? JSON.parse(subscriptions)
      : []

    this.setState({
      subscriptions: parsed,
      tab: parsed.length > 0 ? "listen" : "search",
    })
  }

  render() {
    const { tab } = this.state

    if (tab === "search") {
      return this.renderSearch()
    }

    return this.renderListen()
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

  onPressSearchPodcast = async podcast => {
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

  onPressListenPodcast = podcast => {
    alert(`Open ${podcast.collectionName}`)
  }

  renderSearch() {
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
        {this.renderTabs()}
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
        {this.renderSearchPodcasts()}
      </View>
    )
  }

  renderTabs = () => {
    const { tab } = this.state

    return (
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => this.setState({ tab: "search" })}
        >
          <View
            style={{
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <Text
              style={{
                color:
                  tab === "search" ? "#e0e0e0" : "#007afb",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Search
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState({ tab: "listen" })}
        >
          <View
            style={{
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <Text
              style={{
                color:
                  tab === "listen" ? "#e0e0e0" : "#007afb",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Listen
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  renderSearchPodcasts = () => {
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
          this.renderSearchPodcast(
            podcast,
            subscriptionIds.includes(podcast.collectionId),
          ),
        )}
      </ScrollView>
    )
  }

  renderSearchPodcast = (podcast, isSubscribed) => {
    return (
      <TouchableOpacity
        key={podcast.collectionId}
        onPress={() => {
          if (isSubscribed) {
            return
          }

          this.onPressSearchPodcast(podcast)
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

  renderListen = () => {
    const { subscriptions } = this.state

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
        {this.renderTabs()}
        <ScrollView
          style={{
            flexGrow: 0,
            width: "100%",
            height: "50%",
          }}
        >
          {subscriptions.map(podcast =>
            this.renderListenPodcast(podcast),
          )}
        </ScrollView>
      </View>
    )
  }

  renderListenPodcast = podcast => {
    return (
      <TouchableOpacity
        key={podcast.collectionId}
        onPress={() => this.onPressListenPodcast(podcast)}
      >
        <View
          style={{
            width: "100%",
            height: 200,
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
            source={{
              uri: podcast.artworkUrl600,
            }}
          />
        </View>
      </TouchableOpacity>
    )
  }
}

export default App
