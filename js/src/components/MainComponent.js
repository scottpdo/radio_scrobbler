import React from 'react';
import $ from 'jquery';
import store from 'store';
import { gup } from '../utils';
import { apiKey, appEndpoint } from '../constants';

class MainComponent extends React.Component {

	constructor() {

		super();

		this.state = {
			authenticated: false,
			currentTrack: null
		};
	}

	componentWillMount() {

		let timer = 60;

		let auth = (token) => {
			$.ajax({
				url: appEndpoint,
				type: 'POST',
				data: {
					token
				},
				success: function(response) {
					if ( response.session.key ) {
						store.set('sk', response.session.key);
						this.setState({
							authenticated: true
						});
					}
				}
			});
		}

		let trackChanged = (track) => {
			return this.state.currentTrack && 
				this.state.currentTrack.title !== track.title && 
				this.state.currentTrack.artist !== track.artist && 
				this.state.currentTrack.album !== track.album;
		};

		let scrobble = () => {

			let scrobbleUrl = 'http://ws.audioscrobbler.com/2.0/';

			let timestamp = Math.round(new Date().getTime() / 1000);

			let postData = {
				format: 'json',
				chosenByUser: 0,
				method: 'track.scrobble',
				"artist": this.state.currentTrack.artist,
				"track": this.state.currentTrack.title,
				"timestamp": timestamp,
				api_key: apiKey,
				sk: store.get('sk')
			};

			if ( this.state.currentTrack.album ) postData["album"] = this.state.currentTrack.album;

			// now hash it for the signature
			let dataToHash = '';

			if ( this.state.currentTrack.album ) {
				dataToHash += 'album' + this.state.currentTrack.album;
			}

			dataToHash += 'api_key' + apiKey;
			dataToHash += 'artist' + this.state.currentTrack.artist;
			dataToHash += 'chosenByUser' + '0',
			dataToHash += 'method' + 'track.scrobble';
			dataToHash += 'sk' + store.get('sk');
			dataToHash += 'timestamp' + timestamp;
			dataToHash += 'track' + this.state.currentTrack.title;

			$.ajax({
				url: appEndpoint,
				type: 'POST',
				data: {
					dataToHash
				},
				success(data) {
					
					postData.api_sig = data.signature;

					$.ajax({
						url: scrobbleUrl,
						type: 'POST',
						data: postData,
						success(data) {
							console.log('success', data);
						},
						error(err) {
							console.log('error', err);
						}
					});
				},
				error(err) {
					console.log('error', err);
				}
			});
		}

		// start checking for tracks
		let updateCurrentTrack = () => {
			$.ajax({
				url: appEndpoint,
				success: newTrack => {
					
					if ( !this.state.currentTrack || trackChanged.call(this, newTrack) ) {
						
						this.setState({
							currentTrack: newTrack
						});

						scrobble.call(this);
					}

					setTimeout(updateCurrentTrack, timer * 1000);
				}
			});
		};

		updateCurrentTrack();

		if ( gup('token') ) auth.call(this, gup('token'));

		// it's possible this is no longer valid -- will check when trying to scrobble
		if ( store.get('sk') ) {
			this.setState({
				authenticated: true
			});
		}
	}

	render () {

		let containerStyle = {
			padding: '20px'
		};

		let login = () => {
			window.location.assign('http://www.last.fm/api/auth/?api_key=' + apiKey + '&cb=' + window.location.origin + window.location.pathname);
		};

		let loginStyle = {
			display: this.state.authenticated ? 'none' : 'block'
		};

		let context = 'You are listening but not scrobbling.';
		if ( this.state.authenticated ) {
			context = 'You are authenticated and scrobbling!';
		}

		let contextStyle = {
			fontFamily: 'Helvetica, Arial, sans-serif',
			fontWeight: 'bold'
		};

		return (
			<div style={containerStyle}>
				<button onClick={login} style={loginStyle}>Log In</button>
				<p style={contextStyle}>{context}</p>
			</div>
		);
	}
}

export default MainComponent;