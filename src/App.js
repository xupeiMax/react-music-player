import React, { Component } from 'react'
import $ from 'jquery'
import jplayer from 'jplayer'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import Pubsub from 'pubsub-js'

import './App.css'
import Header from './components/header'
import Play from './pages/play'
import MusicList from './pages/musiclist'
import { MUSIC_LIST } from './sources/musiclist'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      musiclist: MUSIC_LIST,
      currentMusicItem: MUSIC_LIST[0],
      cycleModel: 'cycle'
    };
  }

  componentDidMount() {
    $('#player').jPlayer({
      supplied: 'mp3',
      wmode: 'window'
    });

    this.playMusic(this.state.currentMusicItem);

    $('#player').bind($.jPlayer.event.ended,(e) => {
      switch (this.state.cycleModel) {
        case 'cycle':
          this.autoPlayNext('cycle');
          break;
        case 'once':
          this.autoPlayNext('once');
          break;
        case 'random':
          this.autoPlayNext('random');
          break;
      }
    })

    Pubsub.subscribe('DELETE_MUSIC', (msg, musicitem) => {
      this.setState({
        musiclist: this.state.musiclist.filter(item => {
          return item !== musicitem
        })
      })
    })

    Pubsub.subscribe('PLAY_MUSIC', (msg, musicitem) => {
      this.playMusic(musicitem);
    })
    
    Pubsub.subscribe('PLAY_PREV', (msg) => {
      this.playNext("prev");
    })

    Pubsub.subscribe('PLAY_NEXT', (msg) => {
      this.playNext();
    })

    Pubsub.subscribe('PLAY_REPEAT', (msg) => {
      const MODEL = ['cycle', 'random', 'once'];
      let currentModel = MODEL.indexOf(this.state.cycleModel);
      let newModel = (currentModel + 1) % 3;
      this.setState({
        cycleModel: MODEL[newModel]
      });
    })
    
  }

  componentWillUnmount(){
    $('#player').unbind($.jPlayer.event.ended);
    Pubsub.unsubscribe('DELETE_MUSIC');
    Pubsub.unsubscribe('PLAY_MUSIC'); 
    Pubsub.unsubscribe('PLAY_PREV');
    Pubsub.unsubscribe('PLAY_NEXT');
    Pubsub.unsubscribe('PLAY_REPEAT');
  }

  playMusic(musicitem){
    $('#player').jPlayer('setMedia', {
      mp3: musicitem.file
    }).jPlayer('play')
    this.setState({
      currentMusicItem: musicitem
    })
  }

  playNext(type = "next"){
    let index = this.getMusicIndex(this.state.currentMusicItem);
    let newIndex = null;
    let musicListLength = this.state.musiclist.length;
    let model = this.state.cycleModel;
    if(type === "next"){
      switch (model) {
        case 'random':
          do {
            newIndex = Math.floor(Math.random() * musicListLength);
          } while (newIndex === index)
          break;
        default:
          newIndex = (index + 1) % musicListLength;
      }
    }else{
        switch (model) {
          case 'random':
            do {
              newIndex = Math.floor(Math.random() * musicListLength);
            } while (newIndex === index)
            break;
          default:
            newIndex = (index - 1 + musicListLength) % musicListLength;
        }      
    }

    this.playMusic(this.state.musiclist[newIndex]);
    this.setState({
      currentMusicItem: this.state.musiclist[newIndex]
    })
  }

  autoPlayNext(model){
    let index = this.getMusicIndex(this.state.currentMusicItem);
    let newIndex = null;
    let musicListLength = this.state.musiclist.length;
      switch (model) {
        case 'once':
          newIndex = index;
          break;
        case 'random':
          do {
            newIndex = Math.floor(Math.random() * musicListLength);
          } while (newIndex === index)
          break;
        default:
          newIndex = (index + 1) % musicListLength;
          break;
      }

    this.playMusic(this.state.musiclist[newIndex]);
    this.setState({
      currentMusicItem: this.state.musiclist[newIndex]
    })
  }

  getMusicIndex(musicitem){
    return this.state.musiclist.indexOf(musicitem);
  }

  render() {
    const Home = () => (
      <Play
        currentMusicItem={this.state.currentMusicItem} cycleModel={this.state.cycleModel}
      />
    );

    const List = () => (
      <MusicList
        currentMusicItem={this.state.currentMusicItem}
        musiclist={this.state.musiclist}
      />
    );
    return (
      <Router >
        <section>
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/list" component={List} />
          </Switch>
        </section>
      </Router>
    );
  }
}

export default App;
