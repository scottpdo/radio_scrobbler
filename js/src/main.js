import React from 'react';
import ReactDOM from 'react-dom';

import PlayerComponent from './components/PlayerComponent';
import MainComponent from './components/MainComponent';

ReactDOM.render(
	<PlayerComponent />,
	document.getElementById('player')
);

ReactDOM.render(
	<MainComponent />,
	document.getElementById('main')
);