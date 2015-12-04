import React from 'react';
import { players } from '../constants';

class PlayerComponent extends React.Component {
	
	constructor() {

		super();

		this.state = {
			station: null
		};
	}

	render() {

		let styles = {
			float: 'left',
			marginRight: '20px'
		};

		let choosePlayer = (url) => {

			this.props.stationManager.set(url);

			this.setState({
				station: url
			});
		};

		let listStyle = {
			margin: '20px 0',
			padding: 0
		};

		let listItemStyle = (url) => {
			return {
				color: this.state.station === url ? '#fff' : '#000',
				background: this.state.station === url ? '#999' : 'transparent',
				listStyleType: 'none'
			}
		};

		let playerList = players.map(player => {
			return <li onClick={choosePlayer.bind(this, player.url)} key={Math.round(Math.random() * 1000000)} style={listItemStyle(player.url)}>{player.name}</li>
		});
		
		return (
			<div style={styles}>
				<ul style={listStyle}>
					{playerList}
				</ul>
				<iframe src={this.state.station} width={this.state.station ? 400 : 0} height={this.state.station ? 400 : 0} frameBorder="0"></iframe>
			</div>
		);
	}
}

export default PlayerComponent;