import React, { Component } from 'react'
import $ from 'jquery'
import jplayer from 'jplayer'
import { Link } from "react-router-dom"
import Pubsub from 'pubsub-js'

import './play.css'
import Progress from '../components/progress'

let duration = null;
let isplay = false;
class Play extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            progress: 0,
            volume: 0,
            isPlay: isplay,
            leftTime: ''
        };
        this.playHandler = this.playHandler.bind(this);
        this.progressChange = this.progressChange.bind(this);
        this.volumeChange = this.volumeChange.bind(this);
        this.playPrev = this.playPrev.bind(this);
        this.playNext = this.playNext.bind(this);        
        this.playRepeat = this.playRepeat.bind(this);
    }
    
    componentDidMount() {
        $('#player').bind($.jPlayer.event.timeupdate, (e) => {
            duration = Math.round(e.jPlayer.status.duration);
            this.setState({
                progress: Math.round(e.jPlayer.status.currentPercentAbsolute),
                volume: Math.round(e.jPlayer.options.volume * 100),
                leftTime: this.formatTime(duration * (1 - e.jPlayer.status.currentPercentAbsolute /100 ))
            })
        });
        $('#player').bind($.jPlayer.event.play, (e) => {
            // 拿到当前播放状态
            // 如果正在播放
            if (!e.jPlayer.status.paused) {
                isplay = true
                this.setState({
                    isPlay: isplay
                })
            }
        })
    }

    componentWillUnmount() {
        $('#player').unbind($.jPlayer.event.timeupdate);
        // $('#player').unbind($.jPlayer.event.play);
    }

    progressChange(progress){
        let isPlay = this.state.isPlay;
        if(isPlay){
            $('#player').jPlayer('play', duration * progress);
        }else{
            $('#player').jPlayer('pause', duration * progress);            
        }
        this.setState({
            progress: progress
        })
    }

    volumeChange(progress){     
        $('#player').jPlayer('volume', progress);
        this.setState({
            volume: progress * 100
        })
    }

    playHandler(e) {
        e.stopPropagation();
        if (this.state.isPlay) {
            $('#player').jPlayer('pause');
        } else {
            $('#player').jPlayer('play');
        }
        isplay = !isplay
        this.setState({
            isPlay: isplay
        })
    }

    playPrev(e){
        if (!isplay) {
            isplay = true
            this.setState({
                isPlay: isplay
            })
        }
        e.stopPropagation();
        Pubsub.publish('PLAY_PREV');
    }

    playNext(e) {
        if (!isplay) {
            isplay = true
            this.setState({
                isPlay: isplay
            })
        }
        e.stopPropagation();
        Pubsub.publish('PLAY_NEXT');
    }

    playRepeat(e){
        e.stopPropagation();
        Pubsub.publish('PLAY_REPEAT');
    }

    formatTime(time){
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        seconds = seconds < 10 ? `0${seconds}` : seconds
        return `${minutes}:${seconds}`
    }

    render() {
        let currentMusicItem = this.props.currentMusicItem;
        return (
            <div className="player-page">
                <h1 className="caption"><Link to="/list">我的私人音乐坊 &gt;</Link></h1>
                <div className="mt20 row">
                    <div className="controll-wrapper">
                        <h2 className="music-title">{currentMusicItem.title}</h2>
                        <h3 className="music-artist">{currentMusicItem.artist}</h3>
                        <div className="row mt20">
                            <div className="left-time -col-auto">-{this.state.leftTime}</div>
                            <div className="volume-container">
                                <i className="icon-volume rt" style={{top: 5,left: -5}}></i>
                                <div className="volume-wrapper">
                                    <Progress progress={this.state.volume} progressChange={this.volumeChange} barColor="#aaa"/>
                                </div>
                            </div>
                        </div>
                        <div style={{height: 10,lineHeight: 10,marginTop: 10}}>
                            <Progress progress={this.state.progress} progressChange={this.progressChange}/>
                        </div>
                        <div className="mt35 row">
                            <div>
                                <i className="icon prev" onClick={this.playPrev}></i>
                                <i className={`icon ml20 ${this.state.isPlay?'pause':'play'}`} onClick={this.playHandler}></i>
                                <i className="icon next ml20" onClick={this.playNext}></i>
                            </div>
                            <div className="-col-auto">
                                <i id="repeat" className={`icon repeat-${this.props.cycleModel}`} onClick={this.playRepeat}></i>
                            </div>
                        </div>
                    </div>
                    <div className="-col-auto cover">
                        <img className="music-pic" style={{'animationPlayState': this.state.isPlay ? 'running': 'paused'}} src={currentMusicItem.cover} alt="歌曲名称" />
                    </div>
                </div>
            </div>
        );
    }
}


export default Play;