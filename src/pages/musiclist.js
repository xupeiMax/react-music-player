import React, { Component } from 'react'
import './musiclist.css'
import MusicListItem from '../components/musiclistitem'

class MusicList extends Component{
    constructor(props) {
        super(props);
    }
    render(){
        let musiclist = this.props.musiclist;
        let listEle = null;
        listEle = musiclist.map((item) => {
            return (
                <MusicListItem key={item.id} focus={item === this.props.currentMusicItem} musicitem={item}>{item.title}</MusicListItem>
            );
        })
        return (
            <ul>
                { listEle }
            </ul>
        );
    }
}

export default MusicList;