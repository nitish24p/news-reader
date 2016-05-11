'use strict';

import React from 'react';
 
import {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View,
  ScrollView,
  TouchableHighlight,
  AsyncStorage,
  Image
}  from 'react-native';;

import { Button, Card } from 'react-native-material-design';
 
var GiftedSpinner = require('react-native-gifted-spinner');
 
var api = require('../src/api.js');
 
var moment = require('moment');
 
var TOTAL_NEWS_ITEMS = 10;
 

var NewsItems = React.createClass({
 
    getInitialState: function() {
        return {
          title: 'Top News at the Moment',
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
          }),
          news: {},
          loaded: false
        }    
    },
 
    render: function() {
         
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.header_item}>
                        <Text style={styles.header_text}>{this.state.title}</Text>
                    </View>
                    <View style={styles.header_item}>
                    {  !this.state.loaded && 
                        <GiftedSpinner />
                    }
                    </View>
                </View>
                <View style={styles.body}>
                
                <ScrollView ref="scrollView">
                {
                    this.state.loaded && 
                     
                    <ListView initialListSize={1} dataSource={this.state.news} style={styles.news} renderRow={this.renderNews}></ListView>
                     
                }
                </ScrollView>
                </View>
            </View>
        ); 
         
    },
 
    componentDidMount: function() {
             
        AsyncStorage.getItem('news_items').then((news_items_str) => {
 
            var news_items = JSON.parse(news_items_str);
 
            if(news_items != null){
                 
                AsyncStorage.getItem('time').then((time_str) => {
                    var time = JSON.parse(time_str);
                    var last_cache = time.last_cache;
                    var current_datetime = moment();
 
                    var diff_days = current_datetime.diff(last_cache, 'days');
                     
                    if(diff_days > 0){
                        this.getNews();
                    }else{
                        console.log(news_items);
                        this.updateNewsItemsUI(news_items);
                    }
 
                });
                 
 
            }else{
                this.getNews();
            }
 
        }).done();
 
    },
 
    renderNews: function(news) {
        return (
          <View>
              <Card style={styles.card}>
                    <Card.Media
                        image={<Image source={{uri: 'https://www.practo.com/consult/bundles/cwipage/images/home-banner-v5.jpg'}} />}
                        overlay
                    />
                    <Card.Body>
                        <Text style={styles.news_item_text}>{news.title}</Text>
                    </Card.Body>
                    <Card.Actions position="right">
                        <Button style={styles.action_button} text="Read More" onPress={this.viewPage.bind(this, news.url)} />
                    </Card.Actions>
                </Card>
          </View> 
        );
    },
 
    viewPage: function(url){
        this.props.navigator.push({name: 'web_page', url: url});
    },
 
    updateNewsItemsUI: function(news_items){
     
        if(news_items.length == TOTAL_NEWS_ITEMS){
 
            var ds = this.state.dataSource.cloneWithRows(news_items);
            this.setState({
              'news': ds,
              'loaded': true
            });
 
        }
         
    },
 
    updateNewsItemDB: function(news_items){
 
        if(news_items.length == TOTAL_NEWS_ITEMS){
            AsyncStorage.setItem('news_items', JSON.stringify(news_items));
        }
 
    },
 
    getNews: function() {   
         
        var TOP_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/topstories.json';
        var news_items = [];
 
        AsyncStorage.setItem('time', JSON.stringify({'last_cache': moment()}));
 
        api(TOP_STORIES_URL).then(
          (top_stories) => {
                 console.log(top_stories);
                for(var x = 0; x <= 10; x++){
 
                    var story_url = "https://hacker-news.firebaseio.com/v0/item/" + top_stories[x] + ".json";
 
                    api(story_url).then(
                        (story) => {
 
                            news_items.push(story);
                            this.updateNewsItemsUI(news_items);
                            this.updateNewsItemDB(news_items);
 
                        }
                    );
 
                }
                 
 
            }
 
 
 
        );
         
         
    }
 
});
 
 
 
var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    backgroundColor: '#00695c',
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  body: {
    flex: 9,
    backgroundColor: '#F6F6EF'
  },
  header_item: {
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center'
  },
  header_text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  button: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  news_item: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 5
  },
  news_item_text: {
    color: '#575757',
    fontSize: 18
  },
  action_button: {
    fontSize:55
  },
  card: {
    marginBottom: 20
  }
});
 
module.exports = NewsItems;

