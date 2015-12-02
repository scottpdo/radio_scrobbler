import React from 'react';
import { playerUrl } from '../constants';

class PlayerComponent extends React.Component {
	
	constructor() {
		super();
	}

	render() {

		let styles = {
			float: 'left',
			marginRight: '20px'
		};
		
		return <iframe src={playerUrl} style={styles} width="400" height="400"></iframe>;
	}
}

export default PlayerComponent;