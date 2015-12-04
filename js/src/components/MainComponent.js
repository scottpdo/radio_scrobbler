import React from 'react';
import $ from 'jquery';
import { gup } from '../utils';
import { apiKey, appEndpoint } from '../constants';

class MainComponent extends React.Component {

	constructor() {

		super();

		this.state = {
			authenticated: false,
			currentTrack: null,
			station: null
		};
	}

	componentWillMount() {

		this.props.stationManager.change(station => {
			this.setState({
				station
			}, updateCurrentTrack);
		});

		let timer = 60;

		let auth = (token) => {
			$.ajax({
				url: appEndpoint,
				type: 'POST',
				data: {
					token
				},
				success: (response) => {
					if ( response.session.key ) {
						localStorage.setItem('sk', response.session.key);
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
				sk: localStorage.getItem('sk')
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
			dataToHash += 'sk' + localStorage.getItem('sk');
			dataToHash += 'timestamp' + timestamp;
			dataToHash += 'track' + this.state.currentTrack.title;

			$.ajax({
				url: appEndpoint,
				type: 'POST',
				data: {
					dataToHash
				},
				success: (data) => {
					
					postData.api_sig = data.signature;

					$.ajax({
						url: scrobbleUrl,
						type: 'POST',
						data: postData,
						success(data) {
							console.log('success', data);
						},
						error: (err) => {
							localStorage.removeItem('sk');
							this.setState({
								authenticated: false
							});
						}
					});
				}
			});
		}

		// start checking for tracks
		let updateCurrentTrack = () => {
			if ( this.state.station ) {
				$.ajax({
					url: appEndpoint,
					type: 'POST',
					data: {
						station: this.state.station
					},
					success: newTrack => {
						
						if ( !this.state.currentTrack || trackChanged.call(this, newTrack) ) {
							
							this.setState({
								currentTrack: newTrack
							});

							// prevent user refreshing and returning within the same song
							if ( newTrack.artist !== localStorage.getItem('recentArtist') || newTrack.title !== localStorage.getItem('recentTrack')) {

								scrobble.call(this);
							}

							localStorage.setItem('recentArtist', newTrack.artist);
							localStorage.setItem('recentTrack', newTrack.title);
						}

						setTimeout(updateCurrentTrack, timer * 1000);
					}
				});
			}
		};

		updateCurrentTrack();

		if ( gup('token') ) auth.call(this, gup('token'));

		// it's possible this is no longer valid -- will check when trying to scrobble
		if ( localStorage.getItem('sk') ) {
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

		let revoke = () => {
			localStorage.removeItem('sk');
			this.setState({
				authenticated: false
			});
		};

		let buttonStyle = {
			background: '#a60009',
			color: '#fff',
			cursor: 'pointer',
			border: 0,
			borderRadius: '5px',
			fontSize: '1.1em',
			padding: '0.5em 2em',
			textTransform: 'uppercase'
		};

		let loginStyle = $.extend({}, buttonStyle, {
			display: this.state.authenticated ? 'none' : 'block'
		});

		let revokeStyle = $.extend({}, buttonStyle, {
			display: this.state.authenticated ? 'block' : 'none',
			background: '#aaa',
			fontSize: '0.8em'
		});

		let context = 'You are listening but not scrobbling. Log in to scrobble!';
		if ( this.state.authenticated ) {
			context = 'You are authenticated and scrobbling!';
		}

		let contextStyle = {
			fontFamily: 'Helvetica, Arial, sans-serif',
			fontWeight: 'bold'
		};

		return (
			<div style={containerStyle}>
				<p style={contextStyle}>{context}</p>
				<button onClick={revoke} style={revokeStyle}>Revoke Access</button>
				<button onClick={login} style={loginStyle}>Log In</button>
				<br />
				<br />
				<p><a href="https://twitter.com/scottpdonaldson" className="twitter-follow-button" data-show-count="false">Follow @scottpdonaldson</a></p>
			</div>
		);
	}
}

export default MainComponent;