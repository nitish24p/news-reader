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
  Image,
  Picker
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
                    <View style={styles.category_picker}>
                      <Picker
                        mode={'dropdown'}
                        selectedValue={this.state.category}
                        onValueChange={(topic) => {
                          this.setState({category: topic})
                          this.getNews(topic);
                          this.setState({ loaded : false});
                        }}>
                        <Picker.Item label="Home" value="home"  />
                        <Picker.Item label="Sports" value="sports" />
                        <Picker.Item label="Travel" value="travel" />
                        <Picker.Item label="Food" value="food" />
                        <Picker.Item label="Technology" value="technology" />
                        <Picker.Item label="Movies" value="movies" />
                      </Picker>
                    </View>
                </View>
                <View style={styles.loader}>
                    {  !this.state.loaded && 
                        <GiftedSpinner />
                    }
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
                        this.getNews('home');
                    }else{
                        this.updateNewsItemsUI(news_items);
                    } 
                });

            }else{
                this.getNews('home');
            }
 
        }).done();
 
    },
 
    renderNews: function(news) {
        return (
          <View>
              <Card style={styles.card}>
                    <Card.Media
                        image={<Image source={{uri: news.image}} />}
                        overlay
                    />
                    <Card.Body>
                        <Text style={styles.news_item_text}>{news.title}</Text>
                        <Text style={styles.news_item_text_abstract}>{news.abstract}</Text>
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
 
    getNews: function(topic) {   
        
        var TOP_STORIES_URL = 'https://api.nytimes.com/svc/topstories/v2/' + topic + '.json?api-key=bf978995a5a14d3f8f05ebe8fbba3d30';
        var news_items = [];
        AsyncStorage.setItem('time', JSON.stringify({'last_cache': moment()}));
 
        api(TOP_STORIES_URL).then(
          (top_stories) => {
                var top_stories_results_array = top_stories.results;
                for(var x = 0; x <= 10; x++){
                    if (top_stories_results_array[x].multimedia.length > 4) {
                      var image_url = top_stories_results_array[x].multimedia[Math.floor(Math.random()*4)].url;
                    } else {
                      var image_url = 'http://promokit.eu/wp-content/uploads/2012/10/404_1.jpg';
                    }
                    var news_item = {
                      'title': top_stories_results_array[x].title,
                      'url' : top_stories_results_array[x].url,
                      'image' : image_url,
                      'abstract' : top_stories_results_array[x].abstract
                    }
 
                  news_items.push(news_item);
                  this.updateNewsItemsUI(news_items);
                  this.updateNewsItemDB(news_items);
                }
                 
            }
 
            
 
        );
         
         
    }
 
});
 
 
 
var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  category_picker: {
    flex:1,
  },
  category_picker_item: {
    color: '#eaeaea'
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
    backgroundColor: '#fafafa'
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
  news_item_text_abstract: {
    color: '#575757',
    fontSize: 14,
    marginTop:10
  },
  action_button: {
    fontSize:55
  },
  card: {
    marginBottom: 20
  },
  loader : {
    flex: 1,
    paddingTop: 10
  },
  picker_label: {
    color: '#ffffff'
  }
});
 
module.exports = NewsItems;

