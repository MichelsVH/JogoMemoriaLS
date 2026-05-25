import React, { useState, useEffect } from "react";
import "./card.css";

import { PLACEHOLDER_CARDBACK_PATH } from "../../constants";
import { PLACEHOLDER_CARD_PATH } from "../../constants";

function Card(props) {
  const { name, gameStarted, onFlippedCards, matchedCards } = props;
  const [flipped, setFlipped] = useState(false);

  let flippedClass = flipped ? " flipped" : "";
  
  const [matched, setMatched] = useState(false);
  
  useEffect(() => {
      const isMatchedCard =
      matchedCards.filter((logoName) => logoName === name).length > 0;
      setFlipped(isMatchedCard);
      setMatched(isMatchedCard);
    }, [matchedCards, name]);
    
    let cardFrontClass = matched ? " grayscale" : "";
    let matchedClass = matched ? " inactive" : "";

  return (
    <div className={`card ${flippedClass} ${matchedClass}`} data-logo={name}>
      <img
        src={PLACEHOLDER_CARDBACK_PATH}
        className="card-back"
        alt="card placeholder"
        onClick={() => {
          if (gameStarted) {
            setFlipped(true);
            onFlippedCards(name);
          }
        }}
      />
      <img src={`${PLACEHOLDER_CARD_PATH}${name}.png`} className={`card-front${cardFrontClass} `} />
    </div>
  );
}
export default Card;
