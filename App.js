import React, { Component } from "react"

import {
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"

class App extends Component {
  state = {
    podcasts: undefined,
    terms: undefined,
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

  state = {
    terms: undefined,
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
    const { podcasts } = this.state

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

    return (
      <ScrollView
        style={{
          flexGrow: 0,
          width: "100%",
          height: "50%",
        }}
      >
        {podcasts.map(podcast => (
          <View key={podcast.collectionId}>
            <Text>{podcast.collectionName}</Text>
          </View>
        ))}
      </ScrollView>
    )
  }
}

export default App
