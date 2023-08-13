// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const Juego = () => {
  const startGameApi = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
  const drawCardApi = 'https://deckofcardsapi.com/api/deck/';

  const [deckId, setDeckId] = useState(null);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [machinePoints, setMachinePoints] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerCardImage, setPlayerCardImage] = useState([]);
  const [machineCardImage, setMachineCardImage] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  useEffect(() => {
    fetchNewDeck();
  }, []);

  useEffect(() => {
    if (currentResult) {
      setResults((prevResults) => [...prevResults, currentResult]);
    }
  }, [currentResult]);

  const fetchNewDeck = async () => {
    const response = await fetch(startGameApi);
    const data = await response.json();
    setDeckId(data.deck_id);
    setLoading(false);
  };

  const drawCard = async () => {
    const response = await fetch(`${drawCardApi}${deckId}/draw/?count=1`);
    const data = await response.json();
    const card = data.cards[0];
    const value = getCardValue(card.value);
    return { value, suit: card.suit, image: card.image };
  };

  const getCardValue = (value) => {
    if (value === 'KING' || value === 'QUEEN' || value === 'JACK') {
      return 10;
    } else if (value === 'ACE') {
      return 1;
    } else {
      return parseInt(value);
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    setPlayerPoints(0);
    setMachinePoints(0);
    setRoundsPlayed(0);
    setResults([]);
    await fetchNewDeck();
    setLoading(false);
    playRound();
  };

  const playRound = async () => {
    setRoundsPlayed(roundsPlayed + 1);
    setPlayerCardImage([]); // Reset player's card images
    setMachineCardImage([]); // Reset machine's card images
    setPlayerPoints(0); // Reset player's points
    setMachinePoints(0); // Reset machine's points

    let playerHand = []; // Store player's hand
    let machineHand = []; // Store machine's hand
    let isGameOver = false; // Flag to track if the game is over

    while (!isGameOver) {
      const playerCard = await drawCard();
      playerHand.push(playerCard);
      const machineCard = await drawCard();
      machineHand.push(machineCard);

      // Update card images and points
      setPlayerCardImage(prevImages => [...prevImages, playerCard.image]);
      setMachineCardImage(prevImages => [...prevImages, machineCard.image]);
      setPlayerPoints(prevPoints => prevPoints + playerCard.value);
      setMachinePoints(prevPoints => prevPoints + machineCard.value);

      // Check if either player has 21 points
      if (playerPoints === 21 || machinePoints === 21) {
        isGameOver = true;
      } else if (playerPoints > 21 || machinePoints > 21) {
        isGameOver = true;
      } else {
        // Ask player if they want another card
        const shouldDraw = window.confirm('¿Deseas otra carta?');
        if (!shouldDraw) {
          isGameOver = true;
        }
      }
    }

    determineWinner();
  };

  const determineWinner = () => {
    let result = '';
    if (playerPoints > 21) {
      result = 'Has perdido.';
    } else if (machinePoints > 21) {
      result = 'La máquina ha perdido.';
    } else if (playerPoints === 21) {
      result = '¡Has ganado con 21 puntos!';
    } else if (machinePoints === 21) {
      result = 'La máquina ha ganado con 21 puntos.';
    } else if (playerPoints > machinePoints) {
      result = '¡Has ganado!';
    } else if (machinePoints > playerPoints) {
      result = 'La máquina ha ganado.';
    } else {
      result = 'Empate.';
    }

    setCurrentResult({
      id: uuidv4(),
      jugadorPuntos: playerPoints,
      maquinaPuntos: machinePoints,
      resultado: result,
    });
  };

  return (
    <div className="card-game">
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="game-board">
          <div className="player-machine-area">
            <div className="player-area">
              <h2>Jugador</h2>
              <div className="card-score">
                {playerCardImage.map((image, index) => (
                  <img key={index} src={image} alt={`Player Card ${index}`} />
                ))}
                <span>Puntos: {playerPoints}</span>
              </div>
            </div>

            <div className="machine-area">
              <h2>Máquina</h2>
              <div className="card-score">
                {machineCardImage.map((image, index) => (
                  <img key={index} src={image} alt={`Machine Card ${index}`} />
                ))}
                <span>Puntos: {machinePoints}</span>
              </div>
            </div>
          </div>

          <div className="button-area">
            <button onClick={playRound}>Otra Carta</button>
            <button onClick={determineWinner}>Finalizar</button>
            <button onClick={startNewGame}>Jugar de Nuevo</button>
          </div>

          <div className="result-area">
            <h3>Resultado:</h3>
            <p>{results.length > 0 ? results[results.length - 1].resultado : ''}</p>
          </div>

          <div className="statistics-area">
            <h3>Estadísticas:</h3>
            <table>
              <thead>
                <tr>
                  <th>Partida</th>
                  <th>Jugador</th>
                  <th>Máquina</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((partida, index) => (
                  <tr key={partida.id}>
                    <td>{index + 1}</td>
                    <td>{partida.jugadorPuntos}</td>
                    <td>{partida.maquinaPuntos}</td>
                    <td>{partida.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Juego;
