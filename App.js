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

import { DOMParser } from "xmldom"

class App extends Component {
  state = {
    podcasts: undefined,
    podcast: undefined,
    podcastDocument: undefined,
    track: undefined,
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

  onPressListenPodcast = async podcast => {
    const result = await fetch(podcast.feedUrl)
    const text = await result.text()

    const podcastDocument = new DOMParser().parseFromString(
      text,
      "text/xml",
    )

    this.setState({ podcast, podcastDocument })
  }

  onPressPodcastTrack = async track => {
    const titles = Array.prototype.slice.call(
      track.getElementsByTagName("title"),
    )

    alert(`Play ${titles[0].childNodes[0].nodeValue}`)
  }

  /*
    <item>
      <title>1 Underrated Comic Book Movies</title>
      <itunes:title>1 Underrated Comic Book Movies</itunes:title>
      <description><![CDATA[<p>Mr Sunday and Mason look at terrible comic book movies and any redeeming qualities they mayhave.</p>]]></description>
      <itunes:summary>Mr Sunday and Mason look at terrible comic book movies and any redeeming qualities they may have.</itunes:summary>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:author>Planet Broadcasting</itunes:author>
      <itunes:image href="https://www.omnycontent.com/d/clips/0e353d3f-11cf-44ca-b469-a6c000a35649/15a9b294-191e-4706-b917-a817006d5f59/477caccd-b25f-41fa-8862-a817006ee8ef/image.jpg?t=1508913839&amp;size=Large" />
      <media:content url="https://omnystudio.com/d/clips/0e353d3f-11cf-44ca-b469-a6c000a35649/15a9b294-191e-4706-b917-a817006d5f59/477caccd-b25f-41fa-8862-a817006ee8ef/audio.mp3?utm_source=Podcast&amp;in_playlist=f59b3f65-8f22-4691-ac78-a817006d5f62&amp;t=1534082649" type="audio/mpeg">
        <media:player url="https://omny.fm/shows/the-weekly-planet/1-underrated-comic-book-movies/embed" />
      </media:content>
      <media:content url="https://www.omnycontent.com/d/clips/0e353d3f-11cf-44ca-b469-a6c000a35649/15a9b294-191e-4706-b917-a817006d5f59/477caccd-b25f-41fa-8862-a817006ee8ef/image.jpg?t=1508913839&amp;size=Large" type="image/jpeg" />
      <guid isPermaLink="false">299c9d78798e83388539a68a0244be11</guid>
      <pubDate>Mon, 30 Sep 2013 11:33:00 +0000</pubDate>
      <itunes:duration>01:07:16</itunes:duration>
      <enclosure url="https://omnystudio.com/d/clips/0e353d3f-11cf-44ca-b469-a6c000a35649/15a9b294-191e-4706-b917-a817006d5f59/477caccd-b25f-41fa-8862-a817006ee8ef/audio.mp3?utm_source=Podcast&amp;in_playlist=f59b3f65-8f22-4691-ac78-a817006d5f62&amp;t=1534082649" length="48488331" type="audio/mpeg" />
      <link>https://omny.fm/shows/the-weekly-planet/1-underrated-comic-book-movies</link>
    </item>
  */

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
    const { subscriptions, podcast } = this.state

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
          {podcast
            ? this.renderPodcastTracks()
            : subscriptions.map(podcast =>
                this.renderListenPodcast(podcast),
              )}
        </ScrollView>
      </View>
    )
  }

  renderPodcastTracks = () => {
    const { podcast, podcastDocument } = this.state

    const items = podcastDocument.getElementsByTagName(
      "item",
    )

    return (
      <View>
        <View
          style={{
            width: "100%",
            height: 100,
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
        {Array.prototype.slice
          .call(items)
          .map(this.renderPodcastTrack)}
      </View>
    )
  }

  renderPodcastTrack = track => {
    const links = Array.prototype.slice.call(
      track.getElementsByTagName("link"),
    )

    const titles = Array.prototype.slice.call(
      track.getElementsByTagName("title"),
    )

    return (
      <TouchableOpacity
        key={links[0].childNodes[0].nodeValue}
        onPress={() => this.onPressPodcastTrack(track)}
      >
        <View
          style={{
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <Text
            style={{
              color: "#007afb",
              fontSize: 18,
            }}
          >
            {titles[0].childNodes[0].nodeValue}
          </Text>
        </View>
      </TouchableOpacity>
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
