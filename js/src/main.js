import React from 'react';
import ReactDOM from 'react-dom';

import PlayerComponent from './components/PlayerComponent';
import MainComponent from './components/MainComponent';

let StationManager = () => {
	
	let station = null,
		events = [];

	let set = (playing) => {
		if ( station !== playing ) {
			events.forEach(cb => {
				cb(playing);
			});
		}
		station = playing;
	};

	let get = () => station;

	let change = (cb) => {
		events.push(cb);
	};

	return { get, set, change };

};

let stationManager = StationManager();

ReactDOM.render(
	<PlayerComponent stationManager={stationManager} />,
	document.getElementById('player')
);

ReactDOM.render(
	<MainComponent stationManager={stationManager} />,
	document.getElementById('main')
);