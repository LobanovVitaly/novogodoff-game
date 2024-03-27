const START = 'START';
const RULES = 'RULES';
const RESULTS = 'RESULTS';
const PLAYERS = 'PLAYERS';
const ADD_PLAYER = 'ADD_PLAYER';
const GAME_PROCESS = 'GAME_PROCESS';
const CHOOSE_FRIEND = 'CHOOSE_FRIEND';

class Game extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      currentView: START,
      playersColors: ['yellow', 'red', 'blue', 'green', 'purple'],
      currentPlayersColor: 0,
      players: [
          // { 
          //     name: 'Александр',
          //     color: 'red',
          //     currentPlayer: true,
          //     deleted: false
          // },
        ],
      newPlayerNameText: '',
      wheelIsRotating: false,
      wheelStoped: false,
      currentRotate: null,
      wasEaten: null,
      eatTwoSweets: false,
      skipNextMove: false,
      closedEyes: false,
      redSector: false,
      winner: null,
      treatFriend: false,
      chosenFriend: null, // для "Угостить друга"
      loser: null,
      screenOrientation: (screen.availHeight > screen.availWidth) ? 'vertical' : 'horizontal'
    }
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.setOrientation);
  }


  saveToLocalStorage = () => {
    localStorage.setItem('state', JSON.stringify(this.state))
  }

  setOrientation = () => {
    this.setState({
      screenOrientation: (screen.availHeight > screen.availWidth) ? 'vertical' : 'horizontal'
    });
  }

  changeCurrentView = (view) => {
    this.setState({
      currentView: view
    });
  }

  startGame = () => {
    if(this.state.players.length < 2){
      this.setState({
        currentView: PLAYERS
      });
    }
    else{
      this.setState({
        currentView: GAME_PROCESS
      });
    }
  }

  startNewGame = () => {
    this.setState({
      currentView: PLAYERS,
      players: [],
      newPlayerNameText: '',
      wheelIsRotating: false,
      wheelStoped: false,
      currentRotate: null,
      wasEaten: null,
      winner: null,
      loser: null
    });
  }

  addPlayer = () => {
     this.setState({
        players: [
          ...this.state.players,
          {
            name: this.state.newPlayerNameText,
            currentPlayer: !this.state.players.length? true : false,
            color: this.state.playersColors[this.state.currentPlayersColor],
            deleted: false
          }
        ],
        currentPlayersColor: (this.state.currentPlayersColor == this.state.playersColors.length -1)? 
                                0 : this.state.currentPlayersColor+ 1,
        newPlayerNameText: '',
        currentView: PLAYERS
     });
  }

  changeNewPlayerNameText = (value) => {
    this.setState({newPlayerNameText: value});
  }

  treatFriendHandler = () =>{ // клик по кнопке "Угостить друга"
    this.setState({
      currentView: CHOOSE_FRIEND
    });
  }

  chooseFriendHandler = (playerIndex) => {
    // по клику берется index игрока и записывается в стейт
    // меняется экран - GameProcess с выбранным игроком - кнопки съел, не съел

    this.setState({
      chosenFriend: playerIndex,
      currentView: GAME_PROCESS
    });
  }

  rotateWheelTime = (rotate) => {
    // время поворота колеса в зависимости от угла поворота
    // если придумать формулу, можно избавиться от этого
    let time;

    switch(rotate){
       case 1:time=600;break;case 2:time=700;break;case 3:time=800;break;
       case 4:time=900;break;case 5:time=1e3;break;case 6:time=1100;break;
       case 7:time=1200;break;case 8:time=1300;break;case 9:time=1400;break;
       case 10:time=1500;break;case 11:time=1600;break;case 12:time=1700;break;
       case 13:time=1800;break;case 14:time=1900;break;case 15:time=2e3;break;
       case 16:time=2100;break;case 17:time=2200;break;case 18:time=2300;break;
       case 19:time=2400;break;case 20:time=2500;break;case 21:time=2600;break;
       case 22:time=2700;break;case 23:time=2800;break;case 24:time=2900;break;
       case 25:time=3e3;break;case 26:time=3100;break;case 27:time=3200;break;
       case 28:time=3300;break;case 29:time=3400;break;case 30:time=3500;break;
    }
    return time;
  }

  rotateWheel = (rotate) => {
    this.setState({
      currentRotate: rotate,
      wheelIsRotating: true
    });

    setTimeout(()=>{
        this.setState({
          wheelIsRotating: false,
          wheelStoped: true
        });
      }, this.rotateWheelTime(rotate));
  }

  rotateWheelRedSector = (rotate, redSector) => {
    // 1 - Съешь 2 конфеты
    // 2 - Пропусти следующий ход
    // 3 - Возьми конфету с закрытыми глазами
    // 4 - Угости любой конфетой друга
    this.setState({
      currentRotate: rotate,
      wheelIsRotating: true,
      redSector: true
    });

    setTimeout(()=>{
      switch(redSector){
        case 1:
          this.setState({
              wheelIsRotating: false,
              wheelStoped: true,
              eatTwoSweets: true
            });
          break;
        case 2:
          this.setState({
              wheelIsRotating: false,
              wheelStoped: true,
              skipNextMove: true
            });
          break;
        case 3:
          this.setState({
              wheelIsRotating: false,
              wheelStoped: true,
              closedEyes: true
            });
          break;
        case 4:  
          this.setState({
              wheelIsRotating: false,
              wheelStoped: true,
              treatFriend: true
            });
          break;
      }
    }, this.rotateWheelTime(rotate));
  }

  getCurrentAndNextPlayersIndex = () => {
    let nextPlayerIndex,
        currentPlayerIndex = this.state.players.findIndex(p => {
              return p.currentPlayer
          });

    if(currentPlayerIndex === this.state.players.length-1){
      nextPlayerIndex = 0;
    }
    else{
      nextPlayerIndex = currentPlayerIndex + 1;
    }

    return [currentPlayerIndex, nextPlayerIndex];
  }

  eatHandler = (wasEaten) => { 
    let [currentPlayerIndex, nextPlayerIndex] = this.getCurrentAndNextPlayersIndex();
    let realCurrentPlayerIndex;

    if(this.state.chosenFriend !== null){
      // сохранить индекс настоящего текущего игрока (в realCurrentPlayerIndex)
      // и сделать chosenFriend текущим (currentPlayerIndex), 
      //чтобы проверить - съел/не съел игрок, которого угостили
      realCurrentPlayerIndex = currentPlayerIndex;
      currentPlayerIndex = this.state.chosenFriend;
    }


    // если chosenFriend не съел и выбывает, 
    // то следующим будеи игрок "через одного"
    if(!wasEaten && this.state.chosenFriend !== null && nextPlayerIndex == this.state.chosenFriend){
      //nextPlayerIndex += 1;

      if(!wasEaten && nextPlayerIndex == this.state.players.length-1){
      //если предпоследний игрок угощает последнего и он (последний) не съел,
      // то следующим будет нулевой игрок 
        nextPlayerIndex = 0;
      }
      else{
        nextPlayerIndex += 1;
      }
    }


    let winner;
    
    if(!wasEaten && this.state.players.length === 2){
      if(this.state.chosenFriend !== null){
        console.log(realCurrentPlayerIndex)
        // если выбранный друг не съел, то выигрывает тот, который "угощал"
        winner = this.state.players[realCurrentPlayerIndex].name; 
      }
      else{
        winner = this.state.players[nextPlayerIndex].name; 
      }

      this.setState({
        currentView: RESULTS,
        winner
      });
    }

    else{
      let loser = null;

      if(!wasEaten){
        // выбывает либо выбранный друг, либо текущий игрок 
        if(this.state.chosenFriend !== null){
          loser = this.state.players.find((p, i) => {
            return i === this.state.chosenFriend
          });
        }
        else{
          loser = this.state.players.find((p) => {
            return p.currentPlayer
          });
        }
      } 

      let localCurrentIndex = this.state.chosenFriend !== null ? realCurrentPlayerIndex : currentPlayerIndex;

      let players = this.state.players.map((p, i) => {
          if(this.state.chosenFriend !== null){
            // удалить выбранного игрока, если он не съел
            if(!wasEaten && i == this.state.chosenFriend){
              return {
                ...p,
                deleted: true
              };
            }
          }
          if(i == localCurrentIndex){ // удаляем текущего игрока, если он не съел
            return {
              ...p,
              currentPlayer: false,
              deleted: (!wasEaten && this.state.chosenFriend === null) ? true : false
            }
          }

          if(i == nextPlayerIndex){
            return {
              ...p,
              currentPlayer: true
            }  
          }
          return p;
        });

      players.sort((a, b) => {
        if (a.deleted > b.deleted) {
          return 1;
        } else if (a.deleted < b.deleted) {
          return -1;
        }
        return 0;
      });

      if(!wasEaten){
        players.pop();
      }

      // либо через filter()
      
      this.setState({
          wheelIsRotating: false,
          wheelStoped: false,
          currentRotate: null,
          wasEaten: null,
          players: [...players],
          loser: loser,
          eatTwoSweets: false,
          skipNextMove: false,
          closedEyes: false,
          redSector: false,
          treatFriend: false,
          chosenFriend: null
      });
    }
  }

  skipNextMoveHandler = () => {
    let [currentPlayerIndex, nextPlayerIndex] = this.getCurrentAndNextPlayersIndex();

    let players = this.state.players.map((p, i) => {
          if(i == currentPlayerIndex){
            return {
              ...p,
              currentPlayer: false
            }
          }
          if(i == nextPlayerIndex){
            return {
              ...p,
              currentPlayer: true
            }  
          }
          return p;
        });

    this.setState({
        wheelIsRotating: false,
        wheelStoped: false,
        currentRotate: null,
        wasEaten: null,
        players: [...players],
        loser: null,
        eatTwoSweets: false,
        skipNextMove: false,
        closedEyes: false,
        redSector: false,
    });
  }

  nextPlayerHandler = () => {
    this.setState({
      loser: null,
      chosenFriend: null
    });
  }

  render(){
      switch(this.state.currentView){
        case RULES:
          return (
              <div className={`gameWrapper bgBlue ${this.state.screenOrientation}`}>
               <RulesPage 
                          screenOrientation={this.state.screenOrientation}
                          changeCurrentView={this.changeCurrentView}
                          startGame={this.startGame}
                      />
              </div>
            );
        case RESULTS:
          return (
              <div className={`gameWrapper bgDarkBlue ${this.state.screenOrientation}`}>
               <ResultsPage 
                          screenOrientation={this.state.screenOrientation}
                          players={this.state.players} 
                          changeCurrentView={this.changeCurrentView} 
                          winner={this.state.winner}
                          startNewGame={this.startNewGame} />
              </div>
            );
        case PLAYERS:
          return (
              <div className={`gameWrapper bgBlue ${this.state.screenOrientation}`}>
                <PlayersPage 
                          screenOrientation={this.state.screenOrientation}
                          players={this.state.players}
                          changeCurrentView={this.changeCurrentView}
                          startGame={this.startGame}
                        />
              </div>
            );
        case ADD_PLAYER:
          return (
              <div className={`gameWrapper bgBlue ${this.state.screenOrientation}`}>
                <AddPlayerPage 
                          screenOrientation={this.state.screenOrientation}
                          changeCurrentView={this.changeCurrentView}
                          addPlayer={this.addPlayer}
                          changeNewPlayerNameText={this.changeNewPlayerNameText}
                          newPlayerNameText={this.state.newPlayerNameText} />
              </div>
            );
        case CHOOSE_FRIEND: 
          return(
              <div className={`gameWrapper bgBlue ${this.state.screenOrientation}`}>
                <ChooseFriend 
                      screenOrientation={this.state.screenOrientation}
                      changeCurrentView={this.changeCurrentView}
                      players={this.state.players}
                      chooseFriendHandler={this.chooseFriendHandler}
                      changeCurrentView={this.changeCurrentView}
                  />
              </div>
            );
        case GAME_PROCESS:
          return (
            <div className={`gameWrapper ${this.state.screenOrientation} ${this.state.loser? 'bgGray' : 'bgDarkBlue'}`}>
               <GameProcessPage 
                          screenOrientation={this.state.screenOrientation}
                          changeCurrentView={this.changeCurrentView}
                          players={this.state.players}
                          wheelIsRotating={this.state.wheelIsRotating}
                          wheelStoped={this.state.wheelStoped}
                          eatTwoSweets={this.state.eatTwoSweets}
                          skipNextMove={this.state.skipNextMove}
                          skipNextMoveHandler={this.skipNextMoveHandler}
                          currentRotate={this.state.currentRotate}
                          rotateWheel={this.rotateWheel}
                          rotateWheelRedSector={this.rotateWheelRedSector}
                          eatHandler={this.eatHandler}
                          nextPlayerHandler={this.nextPlayerHandler}
                          redSector={this.state.redSector}
                          loser={this.state.loser}
                          closedEyes={this.state.closedEyes}
                          treatFriend={this.state.treatFriend}
                          treatFriendHandler={this.treatFriendHandler}
                          chosenFriend={this.state.chosenFriend}
                          />
            </div>
          );
        case START: // стартовый экран
          return (
              <div className={`gameWrapper bgDarkBlue ${this.state.screenOrientation}`}>
               <StartPage 
                          screenOrientation={this.state.screenOrientation}
                          changeCurrentView={this.changeCurrentView}
                          startGame={this.startGame}
                        />
              </div>
            );
      }
  }
}

const BackArrowButton = (props) => {
  return (
      <button className="backArrowButton" onClick={()=> {props.changeCurrentView(props.path)}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="27" viewBox="0 0 16 27" fill="none">
          <path d="M12.0911 25.4706C8.30572 21.8558 4.49232 18.2106 0.706964 14.5959C-0.0501077 13.8668 -0.0501077 12.2873 0.706964 11.5582C4.5484 7.91306 8.38984 4.23753 12.2313 0.561991C14.138 -1.26059 16.9419 1.77704 15.0352 3.59962C11.6985 6.75876 8.38984 9.9179 5.08115 13.077C8.3618 16.2058 11.6144 19.3042 14.895 22.4329C16.8298 24.2555 13.9978 27.2932 12.0911 25.4706Z" fill="white"/>
          </svg>
       </button>
    );
};


const StartPage = (props) => {
    let verticalOrientation = props.screenOrientation === 'vertical';
    return (
      <div className="startPage">
        <div id="preloadImg">
          <img src="/img/bg-blue.png" />
          <img src="/img/bg-gray.png" />
        </div>
        {!verticalOrientation &&
          <div className="monsters">
            <div className={'monsterLeftWrap'}>
              <img src="img/monster.png" className={`monster monsterLeft`} />
            </div>
            <div className={'monsterRightWrap'}>
              <img src="img/monster.png" className={`monster monsterRight`} />
            </div> 
          </div>
        }
        <div className="logo">
          <img src="img/game-logo.png" />
        </div>
        <div className="startPageBtns">
          <button className="btn centerBtn yellow" onClick={props.startGame}>Играть</button>
          <button className="btn centerBtn green" onClick={()=> {props.changeCurrentView(RULES)}}>Правила</button>
        </div>
        <div className="wheelWrapper">
          <div className="wheel">
            <svg className="wheelArrow" xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 27 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 1.913C0 2.966 2.609 8.253 5.798 13.663C9.977 20.752 12.14 23.5 13.541 23.5C14.953 23.5 17.061 20.764 21.243 13.506C24.409 8.009 27 2.722 27 1.756C27 0.168 25.708 0 13.5 0C0.871 0 0 0.123 0 1.913Z" fill="#FBD700"></path>
            </svg>
            <img className={`rotating${props.currentRotate}`} src={`img/wheel${!verticalOrientation? '-2' : ''}.png`} />
          </div>
          {verticalOrientation &&
            <div className="monsters">
            <div className={'monsterLeftWrap'}>
              <img src="img/monster.png" className={`monster monsterLeft`} />
            </div>
            <div className={'monsterRightWrap'}>
              <img src="img/monster.png" className={`monster monsterRight`} />
            </div> 
          </div>
          }
        </div>
      </div>
    );
};

const RulesPage = (props) => {
  return (
    <div className="rulesPage">
      <div className="topInnerPageNav">
        <BackArrowButton changeCurrentView={props.changeCurrentView} path={START} />
        <span className="topInnerPageNavTitle">Правила</span>
      </div>

      <div className="scrollableContent">
        <div className="rulesList">
          <div className="rule purple">
            <span className="ruleNumber">1</span>
            Конфеты одного цвета выглядят одинаково, но имеют разные вкусы
          </div>
          <div className="rule orange">
            <span className="ruleNumber">2</span>
            Конфетка со вкусом чеснока от богатыря такая же, как конфетка с апельсином от рокера папы-медведя
          </div>
          <div className="rule blue">
            <span className="ruleNumber">3</span>
            Вращай колесо и узнай леденец какого цвета нужно попробовать
          </div>
          <div className="rule red">
            <span className="ruleNumber">4</span>
            Проигрывает игрок, которому попался «гадкий» вкус и он не смог его съесть
          </div>
        </div>
        <div className="rulesPageStartBtnWrap">
          <button className="btn yellow" onClick={props.startGame}>Начать игру</button>
        </div>
      </div>
    </div>
  );
};

const PlayersPage = (props) => {
  
  let players = props.players.map((p, i) => {
    return (
      <div className={`player ${p.color} playersListElem`} key={i}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M18.2479 13.7521C17.2447 12.749 16.0693 11.9795 14.7883 11.4707C16.1549 10.3646 17.0312 8.67371 17.0312 6.78125C17.0312 3.45541 14.3258 0.75 11 0.75C7.67416 0.75 4.96875 3.45541 4.96875 6.78125C4.96875 8.67372 5.84507 10.3646 7.21171 11.4707C5.9307 11.9795 4.75535 12.749 3.75217 13.7521L3.92895 13.9289L3.75217 13.7521C1.81654 15.6878 0.75 18.2626 0.75 21V21.25H1H2.5625H2.8125V21C2.8125 16.4856 6.48561 12.8125 11 12.8125C15.5144 12.8125 19.1875 16.4856 19.1875 21V21.25H19.4375H21H21.25V21C21.25 18.2626 20.1835 15.6878 18.2479 13.7521L18.0837 13.9163L18.2479 13.7521ZM11 10.75C8.81186 10.75 7.03125 8.96943 7.03125 6.78125C7.03125 4.59307 8.81186 2.8125 11 2.8125C13.1881 2.8125 14.9688 4.59307 14.9688 6.78125C14.9688 8.96943 13.1881 10.75 11 10.75Z" fill="#fff" stroke="#fff" stroke-width="0.5"/>
        </svg>
        {p.name}
      </div>
    );
  });

  return (
    <div className="playersPage">
      <div className="topInnerPageNav">
        <BackArrowButton changeCurrentView={props.changeCurrentView} path={START} />
        <span className="topInnerPageNavTitle">Игроки</span>
      </div>

      <div className="scrollableContent">
        <div className={`playersPageWrap ${!props.players.length? 'empty' : ''}`}>
          <div className="playersPageTitle">
            {props.players.length > 0 && <div dangerouslySetInnerHTML={{ __html: "Добавьте<br/> ещё участников" }}></div>}
            {props.players.length === 0 && <div dangerouslySetInnerHTML={{ __html: "Кто будет<br/>играть?" }}></div>}
          </div>

          <div className="playersList">
            {
              players
            }

            <button className={`btn ${props.players.length? 'purple' : 'yellow'} playersListElem addNewPlayerBtn`} 
                    onClick={()=> {props.changeCurrentView(ADD_PLAYER)}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="27" viewBox="0 0 34 27" fill="none">
                  <path d="M22.5156 16.9844C21.2415 15.7102 19.7442 14.7393 18.1118 14.107C19.8542 12.7376 20.9766 10.6111 20.9766 8.22656C20.9766 4.10377 17.6228 0.75 13.5 0.75C9.37721 0.75 6.02344 4.10377 6.02344 8.22656C6.02344 10.6111 7.14576 12.7376 8.88825 14.107C7.25586 14.7393 5.75857 15.7102 4.48441 16.9844L4.4844 16.9844C2.07658 19.3922 0.75 22.5948 0.75 26V26.25H1H2.95312H3.20312V26C3.20312 20.3225 7.82249 15.7031 13.5 15.7031C19.1775 15.7031 23.7969 20.3225 23.7969 26V26.25H24.0469H26H26.25V26C26.25 22.5948 24.9234 19.3922 22.5156 16.9844L22.3389 17.1611L22.5156 16.9844ZM13.5 13.25C10.7303 13.25 8.47656 10.9963 8.47656 8.22656C8.47656 5.45682 10.7303 3.20312 13.5 3.20312C16.2697 3.20312 18.5234 5.45682 18.5234 8.22656C18.5234 10.9963 16.2697 13.25 13.5 13.25Z" fill="white" stroke="white" stroke-width="0.5"/>
                  <path d="M29.8526 11.2992H31.8586C32.2269 11.2992 32.5442 11.4295 32.8106 11.6902C33.0712 11.9509 33.2016 12.2682 33.2016 12.6422C33.2016 13.0105 33.0712 13.325 32.8106 13.5857C32.5442 13.8464 32.2269 13.9767 31.8586 13.9767H29.8526V15.9912C29.8526 16.3595 29.7222 16.674 29.4616 16.9347C29.2009 17.1954 28.8836 17.3257 28.5096 17.3257C28.1412 17.3257 27.8267 17.1954 27.5661 16.9347C27.3054 16.674 27.1751 16.3595 27.1751 15.9912V13.9767H25.169C24.795 13.9767 24.4777 13.8464 24.217 13.5857C23.9564 13.325 23.826 13.0105 23.826 12.6422C23.826 12.2682 23.9564 11.9509 24.217 11.6902C24.4777 11.4295 24.795 11.2992 25.169 11.2992H27.1751V9.2932C27.1751 8.92486 27.3054 8.60753 27.5661 8.3412C27.8267 8.08053 28.1412 7.9502 28.5096 7.9502C28.8836 7.9502 29.2009 8.08053 29.4616 8.3412C29.7222 8.60753 29.8526 8.92486 29.8526 9.2932V11.2992Z" fill="white"/>
                </svg>
                Добавить игрока
            </button>

            {props.players.length > 1 &&
            <button className="btn green playersListElem start" onClick={props.startGame}>
              Начать игру
            </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const AddPlayerPage = (props) => {  
  let newPlayerName = React.createRef();

  const onChangeNameText = () => {
    let text = newPlayerName.current.value;
    props.changeNewPlayerNameText(text);
  }

  const addPlayer = () => {
    if(props.newPlayerNameText.length !== 0){
      props.addPlayer();
    }
  }

  return (
    <div className="playersPage">
      <div className="topInnerPageNav">
        <BackArrowButton changeCurrentView={props.changeCurrentView} path={PLAYERS} />
        <span className="topInnerPageNavTitle">Игроки</span>
      </div>

      <div className="playersPageTitle">Введите имя</div>

      <div className="addPlayerForm">
        <input type="text"
               name="name" 
               ref={newPlayerName} 
               value={props.newPlayerNameText} 
               placeholder="Имя"
               onChange={onChangeNameText}
               />
        <button className="btn green addPlayerFormBtn" onClick={addPlayer}>Принять</button>
      </div>
    </div>
  );
}

const ChooseFriend = (props) => {
  let friends = props.players.map((p, i)=>{
    if(p.currentPlayer) return;

    return (
      <button className={`btn player ${p.color} playersListElem`} key={i} onClick={()=>{props.chooseFriendHandler(i)}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M18.2479 13.7521C17.2447 12.749 16.0693 11.9795 14.7883 11.4707C16.1549 10.3646 17.0312 8.67371 17.0312 6.78125C17.0312 3.45541 14.3258 0.75 11 0.75C7.67416 0.75 4.96875 3.45541 4.96875 6.78125C4.96875 8.67372 5.84507 10.3646 7.21171 11.4707C5.9307 11.9795 4.75535 12.749 3.75217 13.7521L3.92895 13.9289L3.75217 13.7521C1.81654 15.6878 0.75 18.2626 0.75 21V21.25H1H2.5625H2.8125V21C2.8125 16.4856 6.48561 12.8125 11 12.8125C15.5144 12.8125 19.1875 16.4856 19.1875 21V21.25H19.4375H21H21.25V21C21.25 18.2626 20.1835 15.6878 18.2479 13.7521L18.0837 13.9163L18.2479 13.7521ZM11 10.75C8.81186 10.75 7.03125 8.96943 7.03125 6.78125C7.03125 4.59307 8.81186 2.8125 11 2.8125C13.1881 2.8125 14.9688 4.59307 14.9688 6.78125C14.9688 8.96943 13.1881 10.75 11 10.75Z" fill="#fff" stroke="#fff" stroke-width="0.5"/>
        </svg>
        {p.name}
      </button>
    );
  })

  return (
    <div className={`gameProcessPage`}>
      <div className="gameProcessPageTopNav">
        <button onClick={()=> {props.changeCurrentView(START)}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
            <path d="M30.5455 13.694L30.5456 13.694L18.3068 1.45581C18.3068 1.45577 18.3068 1.45574 18.3067 1.4557C17.6912 0.839905 16.8705 0.5 16.0002 0.5C15.1298 0.5 14.309 0.839936 13.6934 1.45564C13.6934 1.45565 13.6934 1.45566 13.6934 1.45567L1.46089 13.6878L1.46022 13.6885C1.45749 13.6912 1.45084 13.6978 1.44319 13.7058C0.182047 14.9789 0.185628 17.0396 1.45385 18.3078C2.03061 18.8848 2.79258 19.2205 3.60599 19.2587C3.64177 19.2618 3.6774 19.2635 3.71292 19.2638V27.7704C3.71292 29.8291 5.38717 31.503 7.44575 31.503H12.234C12.9957 31.503 13.613 30.8853 13.613 30.124V23.0628C13.613 22.5257 14.0508 22.0879 14.588 22.0879H17.4123C17.9495 22.0879 18.3871 22.5256 18.3871 23.0628V30.124C18.3871 30.8854 19.0044 31.503 19.7661 31.503H24.5543C26.6132 31.503 28.2872 29.8291 28.2872 27.7704V19.2636C29.1397 19.2514 29.9417 18.9126 30.5463 18.308L30.5463 18.308C31.8173 17.0365 31.8178 14.9689 30.5482 13.6966L30.5482 13.6967C30.5481 13.6966 30.548 13.6964 30.5479 13.6963L30.5479 13.6963L30.5479 13.6962L30.5478 13.6963C30.5471 13.6955 30.5463 13.6948 30.5456 13.694L30.5455 13.694ZM30.5455 13.694C30.5319 13.6806 30.5087 13.6591 30.4775 13.6377L30.2045 14.0351L30.1955 14.0483L30.5478 13.6963C30.5471 13.6956 30.5463 13.6948 30.5455 13.694ZM30.5482 13.6967L30.5448 13.7L30.5479 13.6964C30.548 13.6965 30.5481 13.6966 30.5482 13.6967ZM28.5959 16.3581L28.5949 16.3591C28.5485 16.4058 28.4933 16.4428 28.4325 16.468C28.3717 16.4932 28.3065 16.5061 28.2406 16.506H28.2395H26.9081C26.1465 16.506 25.5291 17.1232 25.5291 17.885V27.7704C25.5291 28.3073 25.0915 28.745 24.5543 28.745H21.1451V23.0628C21.1451 21.0042 19.4711 19.3299 17.4122 19.3299H14.5881C12.5293 19.3299 10.855 21.0041 10.855 23.0628V28.745H7.44586C6.90877 28.745 6.47097 28.3072 6.47097 27.7704V17.8849C6.47097 17.1232 5.85359 16.5059 5.09197 16.5059H3.7991C3.78354 16.505 3.76796 16.5045 3.75236 16.5041L3.75103 16.5041C3.61785 16.5018 3.4963 16.4498 3.40466 16.358L3.40438 16.3577C3.20937 16.1627 3.20811 15.8447 3.40118 15.648C3.40456 15.6446 3.40782 15.6413 3.41095 15.6381L15.6439 3.40572L15.645 3.40454C15.6913 3.35792 15.7465 3.32096 15.8072 3.2958C15.8679 3.27064 15.933 3.25779 15.9987 3.25799H16.0002C16.1356 3.25799 16.2604 3.30964 16.3564 3.40566L16.3565 3.40572L28.5921 15.6411L28.592 15.6412L28.5994 15.6483L28.6001 15.6489C28.7922 15.8462 28.7903 16.1637 28.5959 16.3581ZM3.48303 15.5427C3.48996 15.5308 3.48477 15.5417 3.47091 15.5625C3.47717 15.5528 3.4814 15.5455 3.48303 15.5427ZM28.624 16.9299C28.5021 16.9804 28.3714 17.0063 28.2395 17.006L28.624 16.9299Z" fill="white" stroke="white"/>
          </svg>
        </button>
        <button onClick={()=> {props.changeCurrentView(RULES)}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.9449 24.9437L24.9437 24.9449C23.7703 26.1248 22.3756 27.0616 20.8396 27.7016C19.3035 28.3416 17.6562 28.6722 15.9922 28.6746C14.3281 28.6769 12.6799 28.3508 11.1421 27.715C9.60426 27.0793 8.20698 26.1464 7.03031 24.9697C5.85364 23.793 4.9207 22.3957 4.28495 20.8579C3.64921 19.3201 3.32315 17.6719 3.32545 16.0078C3.32775 14.3438 3.65837 12.6965 4.29838 11.1604C4.93838 9.62438 5.87517 8.22968 7.0551 7.05627L7.05627 7.0551C8.22968 5.87517 9.62438 4.93838 11.1604 4.29838C12.6965 3.65837 14.3438 3.32775 16.0078 3.32545C17.6719 3.32315 19.3201 3.64921 20.8579 4.28495C22.3957 4.9207 23.793 5.85364 24.9697 7.03031C26.1464 8.20698 27.0793 9.60426 27.715 11.1421C28.3508 12.6799 28.6769 14.3281 28.6746 15.9922C28.6722 17.6562 28.3416 19.3035 27.7016 20.8396C27.0616 22.3756 26.1248 23.7703 24.9449 24.9437ZM16 0.7C7.55033 0.7 0.7 7.55033 0.7 16C0.7 24.4497 7.55033 31.3 16 31.3C24.4497 31.3 31.3 24.4497 31.3 16C31.3 7.55033 24.4497 0.7 16 0.7Z" fill="white" stroke="white" stroke-width="0.6"/>
            <path d="M13.9264 21.1087L12.1294 22.8897L12.1293 22.8897C11.9941 23.0238 11.8867 23.1832 11.8133 23.3588C11.7399 23.5344 11.7019 23.7229 11.7014 23.9132C11.701 24.1036 11.7381 24.2922 11.8108 24.4681C11.8834 24.6441 11.99 24.804 12.1246 24.9387L12.1252 24.9393C12.3962 25.2088 12.7628 25.3601 13.145 25.3601C13.5269 25.3601 13.8934 25.209 14.1643 24.9397L13.9264 21.1087ZM13.9264 21.1087L12.1331 19.3255C12.133 19.3254 12.133 19.3253 12.1329 19.3253C11.9978 19.1913 11.8905 19.0321 11.8171 18.8566C11.7437 18.681 11.7057 18.4926 11.7052 18.3023C11.7048 18.112 11.742 17.9235 11.8146 17.7476C11.8872 17.5716 11.9938 17.4118 12.1283 17.2772C12.3986 17.0068 12.765 16.8545 13.1472 16.8536C13.5295 16.8527 13.8966 17.0033 14.1681 17.2724C14.1681 17.2724 14.1681 17.2724 14.1681 17.2725L15.9764 19.064L17.7574 17.2796L17.7577 17.2793C18.0287 17.0084 18.3962 16.8562 18.7794 16.8562C19.1626 16.8562 19.53 17.0084 19.801 17.2792C19.9354 17.4133 20.0421 17.5726 20.1148 17.748C20.1876 17.9233 20.225 18.1113 20.225 18.3012C20.225 18.4911 20.1876 18.6791 20.1148 18.8545C20.0421 19.0297 19.9356 19.1889 19.8013 19.323L13.9264 21.1087ZM14.1647 24.9393L15.9726 23.1482L17.7574 24.9363C17.7574 24.9363 17.7574 24.9363 17.7574 24.9363C17.8915 25.0707 18.0508 25.1773 18.2262 25.2501C18.4016 25.3228 18.5896 25.3603 18.7794 25.3603C18.9693 25.3603 19.1573 25.3228 19.3327 25.2501C19.508 25.1774 19.6672 25.0708 19.8013 24.9365C19.9356 24.8024 20.0421 24.6432 20.1148 24.4679C20.1876 24.2926 20.225 24.1046 20.225 23.9147C20.225 23.7248 20.1876 23.5368 20.1148 23.3614C20.0421 23.1862 19.9356 23.027 19.8014 22.893C19.8013 22.8929 19.8012 22.8928 19.801 22.8926L18.0187 21.1063L19.801 19.3233L14.1647 24.9393ZM12.1225 10.2398L12.1221 10.2401C11.8518 10.5111 11.7 10.8782 11.7 11.261C11.7 11.6437 11.8518 12.0108 12.1221 12.2818L12.1224 12.282L14.7969 14.9565C14.7969 14.9566 14.797 14.9566 14.797 14.9566C14.8919 15.0517 15.0045 15.1271 15.1286 15.1786C15.2527 15.23 15.3857 15.2565 15.52 15.2565C15.6544 15.2565 15.7874 15.23 15.9115 15.1786C16.0356 15.1271 16.1483 15.0516 16.2432 14.9565L16.2435 14.9563L20.9988 10.1792C20.9988 10.1792 20.9988 10.1791 20.9989 10.1791C21.2669 9.91002 21.4182 9.54617 21.42 9.16634C21.4218 8.78731 21.2745 8.42281 21.01 8.1514L20.998 8.13876L20.998 8.13874L20.9949 8.13547C20.8612 7.99867 20.7018 7.88974 20.5258 7.81499C20.3498 7.74025 20.1607 7.70117 19.9695 7.70003C19.7783 7.69888 19.5887 7.73569 19.4118 7.80833C19.235 7.88096 19.0742 7.98797 18.939 8.12317L18.939 8.1232L17.1107 9.95148L15.4945 11.5676L14.1668 10.2399L14.1667 10.2398C13.8955 9.96886 13.5279 9.81667 13.1446 9.81667C12.7613 9.81667 12.3936 9.96886 12.1225 10.2398Z" fill="white" stroke="white" stroke-width="0.6"/>
          </svg>
        </button>
      </div>
      <div className="scrollableContent">
        <div className="playersPageTitle">Выберите друга, которого<br/> хотите угостить</div>

        <div className="playersList">
          {friends}
        </div>
      </div>
    </div>
  );
}

const GameProcessPage = (props) => {
  //debugger;
  let currentPlayer;

  if(props.chosenFriend !== null){
    currentPlayer = props.players[props.chosenFriend];
  }
  else{
    currentPlayer = props.players.find(p => {
            return p.currentPlayer
        });
  }

  let verticalOrientation = props.screenOrientation === 'vertical';
  
  const rotating = () => {
    let randomNumber = Math.floor(Math.random() * (30 - 1) + 1);
    let redSectorRandomNumber;
    
    
    if(props.currentRotate !== randomNumber){
      if((verticalOrientation && (randomNumber == 3 || randomNumber == 13 || randomNumber == 23)) 
        || (!verticalOrientation && (randomNumber == 4 || randomNumber == 14 || randomNumber == 24))){
        // 1 - Съешь 2 конфеты
        // 2 - Пропусти следующий ход
        redSectorRandomNumber = Math.round(Math.random( )) + 1 ;
        //redSectorRandomNumber = 1;
        props.rotateWheelRedSector(randomNumber, redSectorRandomNumber);
      }
      else if((verticalOrientation && (randomNumber == 8 || randomNumber == 18 || randomNumber == 28)) 
        || (!verticalOrientation && (randomNumber == 9 || randomNumber == 19 || randomNumber == 29))){
          // 3 - Возьми конфету с закрытыми глазами
          // 4 - Угости любой конфетой друга
          
          redSectorRandomNumber = Math.round(Math.random() + 3);
          //redSectorRandomNumber = 3;
          props.rotateWheelRedSector(randomNumber, redSectorRandomNumber);
      }   
      else{
        props.rotateWheel(randomNumber);
      }
    }
    else{
      rotating();
    }
  }

  return (
    <div className={`gameProcessPage ${props.loser? 'loser' : ''}`}>
      <div className="gameProcessPageTopNav">
        <button onClick={()=> {props.changeCurrentView(START)}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
            <path d="M30.5455 13.694L30.5456 13.694L18.3068 1.45581C18.3068 1.45577 18.3068 1.45574 18.3067 1.4557C17.6912 0.839905 16.8705 0.5 16.0002 0.5C15.1298 0.5 14.309 0.839936 13.6934 1.45564C13.6934 1.45565 13.6934 1.45566 13.6934 1.45567L1.46089 13.6878L1.46022 13.6885C1.45749 13.6912 1.45084 13.6978 1.44319 13.7058C0.182047 14.9789 0.185628 17.0396 1.45385 18.3078C2.03061 18.8848 2.79258 19.2205 3.60599 19.2587C3.64177 19.2618 3.6774 19.2635 3.71292 19.2638V27.7704C3.71292 29.8291 5.38717 31.503 7.44575 31.503H12.234C12.9957 31.503 13.613 30.8853 13.613 30.124V23.0628C13.613 22.5257 14.0508 22.0879 14.588 22.0879H17.4123C17.9495 22.0879 18.3871 22.5256 18.3871 23.0628V30.124C18.3871 30.8854 19.0044 31.503 19.7661 31.503H24.5543C26.6132 31.503 28.2872 29.8291 28.2872 27.7704V19.2636C29.1397 19.2514 29.9417 18.9126 30.5463 18.308L30.5463 18.308C31.8173 17.0365 31.8178 14.9689 30.5482 13.6966L30.5482 13.6967C30.5481 13.6966 30.548 13.6964 30.5479 13.6963L30.5479 13.6963L30.5479 13.6962L30.5478 13.6963C30.5471 13.6955 30.5463 13.6948 30.5456 13.694L30.5455 13.694ZM30.5455 13.694C30.5319 13.6806 30.5087 13.6591 30.4775 13.6377L30.2045 14.0351L30.1955 14.0483L30.5478 13.6963C30.5471 13.6956 30.5463 13.6948 30.5455 13.694ZM30.5482 13.6967L30.5448 13.7L30.5479 13.6964C30.548 13.6965 30.5481 13.6966 30.5482 13.6967ZM28.5959 16.3581L28.5949 16.3591C28.5485 16.4058 28.4933 16.4428 28.4325 16.468C28.3717 16.4932 28.3065 16.5061 28.2406 16.506H28.2395H26.9081C26.1465 16.506 25.5291 17.1232 25.5291 17.885V27.7704C25.5291 28.3073 25.0915 28.745 24.5543 28.745H21.1451V23.0628C21.1451 21.0042 19.4711 19.3299 17.4122 19.3299H14.5881C12.5293 19.3299 10.855 21.0041 10.855 23.0628V28.745H7.44586C6.90877 28.745 6.47097 28.3072 6.47097 27.7704V17.8849C6.47097 17.1232 5.85359 16.5059 5.09197 16.5059H3.7991C3.78354 16.505 3.76796 16.5045 3.75236 16.5041L3.75103 16.5041C3.61785 16.5018 3.4963 16.4498 3.40466 16.358L3.40438 16.3577C3.20937 16.1627 3.20811 15.8447 3.40118 15.648C3.40456 15.6446 3.40782 15.6413 3.41095 15.6381L15.6439 3.40572L15.645 3.40454C15.6913 3.35792 15.7465 3.32096 15.8072 3.2958C15.8679 3.27064 15.933 3.25779 15.9987 3.25799H16.0002C16.1356 3.25799 16.2604 3.30964 16.3564 3.40566L16.3565 3.40572L28.5921 15.6411L28.592 15.6412L28.5994 15.6483L28.6001 15.6489C28.7922 15.8462 28.7903 16.1637 28.5959 16.3581ZM3.48303 15.5427C3.48996 15.5308 3.48477 15.5417 3.47091 15.5625C3.47717 15.5528 3.4814 15.5455 3.48303 15.5427ZM28.624 16.9299C28.5021 16.9804 28.3714 17.0063 28.2395 17.006L28.624 16.9299Z" fill="white" stroke="white"/>
          </svg>
        </button>
        <button onClick={()=> {props.changeCurrentView(RULES)}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.9449 24.9437L24.9437 24.9449C23.7703 26.1248 22.3756 27.0616 20.8396 27.7016C19.3035 28.3416 17.6562 28.6722 15.9922 28.6746C14.3281 28.6769 12.6799 28.3508 11.1421 27.715C9.60426 27.0793 8.20698 26.1464 7.03031 24.9697C5.85364 23.793 4.9207 22.3957 4.28495 20.8579C3.64921 19.3201 3.32315 17.6719 3.32545 16.0078C3.32775 14.3438 3.65837 12.6965 4.29838 11.1604C4.93838 9.62438 5.87517 8.22968 7.0551 7.05627L7.05627 7.0551C8.22968 5.87517 9.62438 4.93838 11.1604 4.29838C12.6965 3.65837 14.3438 3.32775 16.0078 3.32545C17.6719 3.32315 19.3201 3.64921 20.8579 4.28495C22.3957 4.9207 23.793 5.85364 24.9697 7.03031C26.1464 8.20698 27.0793 9.60426 27.715 11.1421C28.3508 12.6799 28.6769 14.3281 28.6746 15.9922C28.6722 17.6562 28.3416 19.3035 27.7016 20.8396C27.0616 22.3756 26.1248 23.7703 24.9449 24.9437ZM16 0.7C7.55033 0.7 0.7 7.55033 0.7 16C0.7 24.4497 7.55033 31.3 16 31.3C24.4497 31.3 31.3 24.4497 31.3 16C31.3 7.55033 24.4497 0.7 16 0.7Z" fill="white" stroke="white" stroke-width="0.6"/>
            <path d="M13.9264 21.1087L12.1294 22.8897L12.1293 22.8897C11.9941 23.0238 11.8867 23.1832 11.8133 23.3588C11.7399 23.5344 11.7019 23.7229 11.7014 23.9132C11.701 24.1036 11.7381 24.2922 11.8108 24.4681C11.8834 24.6441 11.99 24.804 12.1246 24.9387L12.1252 24.9393C12.3962 25.2088 12.7628 25.3601 13.145 25.3601C13.5269 25.3601 13.8934 25.209 14.1643 24.9397L13.9264 21.1087ZM13.9264 21.1087L12.1331 19.3255C12.133 19.3254 12.133 19.3253 12.1329 19.3253C11.9978 19.1913 11.8905 19.0321 11.8171 18.8566C11.7437 18.681 11.7057 18.4926 11.7052 18.3023C11.7048 18.112 11.742 17.9235 11.8146 17.7476C11.8872 17.5716 11.9938 17.4118 12.1283 17.2772C12.3986 17.0068 12.765 16.8545 13.1472 16.8536C13.5295 16.8527 13.8966 17.0033 14.1681 17.2724C14.1681 17.2724 14.1681 17.2724 14.1681 17.2725L15.9764 19.064L17.7574 17.2796L17.7577 17.2793C18.0287 17.0084 18.3962 16.8562 18.7794 16.8562C19.1626 16.8562 19.53 17.0084 19.801 17.2792C19.9354 17.4133 20.0421 17.5726 20.1148 17.748C20.1876 17.9233 20.225 18.1113 20.225 18.3012C20.225 18.4911 20.1876 18.6791 20.1148 18.8545C20.0421 19.0297 19.9356 19.1889 19.8013 19.323L13.9264 21.1087ZM14.1647 24.9393L15.9726 23.1482L17.7574 24.9363C17.7574 24.9363 17.7574 24.9363 17.7574 24.9363C17.8915 25.0707 18.0508 25.1773 18.2262 25.2501C18.4016 25.3228 18.5896 25.3603 18.7794 25.3603C18.9693 25.3603 19.1573 25.3228 19.3327 25.2501C19.508 25.1774 19.6672 25.0708 19.8013 24.9365C19.9356 24.8024 20.0421 24.6432 20.1148 24.4679C20.1876 24.2926 20.225 24.1046 20.225 23.9147C20.225 23.7248 20.1876 23.5368 20.1148 23.3614C20.0421 23.1862 19.9356 23.027 19.8014 22.893C19.8013 22.8929 19.8012 22.8928 19.801 22.8926L18.0187 21.1063L19.801 19.3233L14.1647 24.9393ZM12.1225 10.2398L12.1221 10.2401C11.8518 10.5111 11.7 10.8782 11.7 11.261C11.7 11.6437 11.8518 12.0108 12.1221 12.2818L12.1224 12.282L14.7969 14.9565C14.7969 14.9566 14.797 14.9566 14.797 14.9566C14.8919 15.0517 15.0045 15.1271 15.1286 15.1786C15.2527 15.23 15.3857 15.2565 15.52 15.2565C15.6544 15.2565 15.7874 15.23 15.9115 15.1786C16.0356 15.1271 16.1483 15.0516 16.2432 14.9565L16.2435 14.9563L20.9988 10.1792C20.9988 10.1792 20.9988 10.1791 20.9989 10.1791C21.2669 9.91002 21.4182 9.54617 21.42 9.16634C21.4218 8.78731 21.2745 8.42281 21.01 8.1514L20.998 8.13876L20.998 8.13874L20.9949 8.13547C20.8612 7.99867 20.7018 7.88974 20.5258 7.81499C20.3498 7.74025 20.1607 7.70117 19.9695 7.70003C19.7783 7.69888 19.5887 7.73569 19.4118 7.80833C19.235 7.88096 19.0742 7.98797 18.939 8.12317L18.939 8.1232L17.1107 9.95148L15.4945 11.5676L14.1668 10.2399L14.1667 10.2398C13.8955 9.96886 13.5279 9.81667 13.1446 9.81667C12.7613 9.81667 12.3936 9.96886 12.1225 10.2398Z" fill="white" stroke="white" stroke-width="0.6"/>
          </svg>
        </button>
      </div>
      {props.wheelIsRotating && !props.wheelStoped && 
        <img src="img/game-logo.png" className="gameProcessPageLogo"/>  
      }
      {props.loser && !props.wheelIsRotating && !props.wheelStoped &&
        <img src="img/game-logo.png" className="gameProcessPageLogo"/>  
      }
      {!props.wheelIsRotating && !props.wheelStoped && !props.loser && 
        <p className="gameProcessPageSlogan rogalik whiteStrokeText" 
           data-text="Верти, Рискни и&nbsp;Слопай">
           Верти, Рискни и&nbsp;Слопай
        </p>  
      }
      {!props.wheelIsRotating && props.wheelStoped &&
        <p className="gameProcessPageSlogan rogalik whiteStrokeText" 
           data-text="Поймай удачу за&nbsp;вкус">
           Поймай удачу за&nbsp;вкус
        </p> 
      }


       {/* обычное состояние */} 
      {!props.loser &&
        <div className="gameProcessControls">
          <div>
            <div className={`btn ${currentPlayer.color} currentUser`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M0.75 21V21.25H1H2.5625H2.8125V21C2.8125 16.4856 6.48561 12.8125 11 12.8125C15.5144 12.8125 19.1875 16.4856 19.1875 21V21.25H19.4375H21H21.25V21C21.25 18.2626 20.1835 15.6878 18.2479 13.7521L18.0711 13.9289L18.2479 13.7521C17.2447 12.749 16.0693 11.9795 14.7883 11.4707C16.1549 10.3646 17.0312 8.67371 17.0312 6.78125C17.0312 3.45541 14.3258 0.75 11 0.75C7.67416 0.75 4.96875 3.45541 4.96875 6.78125C4.96875 8.67372 5.84507 10.3646 7.21171 11.4707C5.9307 11.9795 4.75535 12.749 3.75217 13.7521L3.92895 13.9289L3.75217 13.7521C1.81654 15.6878 0.75 18.2626 0.75 21ZM11 10.75C8.81186 10.75 7.03125 8.96943 7.03125 6.78125C7.03125 4.59307 8.81186 2.8125 11 2.8125C13.1881 2.8125 14.9688 4.59307 14.9688 6.78125C14.9688 8.96943 13.1881 10.75 11 10.75Z" fill="#FFF" stroke="#FFF" stroke-width="0.5"/>
              </svg>
              {currentPlayer.name}
            </div>
          </div>
          <div>
            {!props.wheelIsRotating && !props.wheelStoped && 
            <button 
                className="btn green gameProcessBtn rotateWheelBtn"
                onClick={rotating}  
              >
              Вращать колесо
            </button>
            }

            {props.wheelStoped && props.skipNextMove && 
              <div>
                <p className="gameProcessDescr">Пропусти ход</p>
                <button className="btn green gameProcessBtn" onClick={props.skipNextMoveHandler}>Следующий игрок</button>
              </div>
            }

            {props.wheelStoped && (props.eatTwoSweets || props.closedEyes) && 
              <div>
                <p className="gameProcessDescr">
                  {props.eatTwoSweets &&
                    <span>Съешь 2 конфеты</span>
                  }
                  {props.closedEyes &&
                    <span>Возьми конфету <br/>с закрытыми глазами</span>
                  }
                </p>
                <div className="eatBtns">
                  <button className="btn green" onClick={()=>{props.eatHandler(true)}}>Съел</button>
                  <button className="btn gray" onClick={()=>{props.eatHandler(false)}}>Не съел</button>
                </div>
              </div>
            }

            {props.wheelStoped && props.treatFriend && props.chosenFriend === null &&
              <button className="btn red gameProcessBtn" onClick={props.treatFriendHandler}>Угостить друга</button>
            }

            {((props.wheelStoped && !props.redSector) || (props.wheelStoped && props.chosenFriend !== null)) && 
              <div>
                {(props.wheelStoped && !props.redSector) &&
                <p className="gameProcessDescr">Возьми конфету<br/> выпавшего цвета</p>
                }
                <div className="eatBtns">
                  <button className="btn green" onClick={()=>{props.eatHandler(true)}}>Съел</button>
                  <button className="btn gray" onClick={()=>{props.eatHandler(false)}}>Не съел</button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      {/* есть проигравший */}
      {props.loser &&
        <div className="gameProcessControls">
          <div className="btn yellow currentUser">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M0.75 21V21.25H1H2.5625H2.8125V21C2.8125 16.4856 6.48561 12.8125 11 12.8125C15.5144 12.8125 19.1875 16.4856 19.1875 21V21.25H19.4375H21H21.25V21C21.25 18.2626 20.1835 15.6878 18.2479 13.7521L18.0711 13.9289L18.2479 13.7521C17.2447 12.749 16.0693 11.9795 14.7883 11.4707C16.1549 10.3646 17.0312 8.67371 17.0312 6.78125C17.0312 3.45541 14.3258 0.75 11 0.75C7.67416 0.75 4.96875 3.45541 4.96875 6.78125C4.96875 8.67372 5.84507 10.3646 7.21171 11.4707C5.9307 11.9795 4.75535 12.749 3.75217 13.7521L3.92895 13.9289L3.75217 13.7521C1.81654 15.6878 0.75 18.2626 0.75 21ZM11 10.75C8.81186 10.75 7.03125 8.96943 7.03125 6.78125C7.03125 4.59307 8.81186 2.8125 11 2.8125C13.1881 2.8125 14.9688 4.59307 14.9688 6.78125C14.9688 8.96943 13.1881 10.75 11 10.75Z" fill="#2D79BE" stroke="#2D79BE" stroke-width="0.5"/>
              </svg>
              {props.loser.name}
          </div>
          <p className="gameProcessDescr">не съел конфету<br/> и выбывает</p>
          <button className="btn green gameProcessBtn" onClick={props.nextPlayerHandler}>Следующий игрок</button>
        </div>
      }

      <div className="wheelWrapper">
        <div className="wheel">
          <svg className="wheelArrow" xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 27 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 1.913C0 2.966 2.609 8.253 5.798 13.663C9.977 20.752 12.14 23.5 13.541 23.5C14.953 23.5 17.061 20.764 21.243 13.506C24.409 8.009 27 2.722 27 1.756C27 0.168 25.708 0 13.5 0C0.871 0 0 0.123 0 1.913Z" fill="#FBD700"></path>
          </svg>
          <img className={`rotating${props.currentRotate}`} src={`img/wheel${!verticalOrientation? '-2' : ''}.png`} />
        </div>
        <div className="monsters">
          <div className={'monsterLeftWrap'}>
            <img src="img/monster.png" className={`monster monsterLeft ${props.wheelIsRotating? 'animate' : ''}`} />
          </div>  
          <div className={'monsterRightWrap'}>
            <img src="img/monster.png" className={`monster monsterRight ${props.wheelIsRotating? 'animate' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

const ResultsPage = (props) => {
  return (
    <div className="resultPage">
      <div className="garland">
      </div>

      <div className="resultPageInnerWrap">
        <p className="congratulations rogalik whiteStrokeText" data-text="Поздравляем">Поздравляем</p>
        <div>
          <p className="winner red">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M18.2479 13.7521C17.2447 12.749 16.0693 11.9795 14.7883 11.4707C16.1549 10.3646 17.0312 8.67371 17.0312 6.78125C17.0312 3.45541 14.3258 0.75 11 0.75C7.67416 0.75 4.96875 3.45541 4.96875 6.78125C4.96875 8.67372 5.84507 10.3646 7.21171 11.4707C5.9307 11.9795 4.75535 12.749 3.75217 13.7521L3.92895 13.9289L3.75217 13.7521C1.81654 15.6878 0.75 18.2626 0.75 21V21.25H1H2.5625H2.8125V21C2.8125 16.4856 6.48561 12.8125 11 12.8125C15.5144 12.8125 19.1875 16.4856 19.1875 21V21.25H19.4375H21H21.25V21C21.25 18.2626 20.1835 15.6878 18.2479 13.7521L18.0837 13.9163L18.2479 13.7521ZM11 10.75C8.81186 10.75 7.03125 8.96943 7.03125 6.78125C7.03125 4.59307 8.81186 2.8125 11 2.8125C13.1881 2.8125 14.9688 4.59307 14.9688 6.78125C14.9688 8.96943 13.1881 10.75 11 10.75Z" fill="white" stroke="white" stroke-width="0.5"/>
            </svg>
            {props.winner}
          </p>
        </div>
        <div>
          <p className="winner btn green">выиграл игру</p>
        </div>

        <button className="btn yellow startNewGameBtn"onClick={props.startNewGame}>
          <svg xmlns="http://www.w3.org/2000/svg" width="27" height="28" viewBox="0 0 27 28" fill="none">
            <path d="M25.6802 11.5194L25.6802 11.5194L15.4813 1.32093C15.4813 1.32089 15.4812 1.32086 15.4812 1.32082C14.9527 0.792029 14.2475 0.5 13.5002 0.5C12.7527 0.5 12.0476 0.79206 11.5189 1.32078C11.5189 1.32079 11.5189 1.32079 11.5189 1.3208L1.32515 11.5142L1.32514 11.5142L1.32461 11.5148C1.32244 11.5169 1.31655 11.5228 1.30962 11.5301C0.226947 12.6235 0.230142 14.3928 1.31918 15.482C1.81415 15.9772 2.46818 16.2656 3.16614 16.2988C3.16991 16.2991 3.17367 16.2994 3.17743 16.2997V23.3086C3.17743 25.0702 4.60996 26.5025 6.37146 26.5025H10.3617C11.0425 26.5025 11.5941 25.9504 11.5941 25.27V19.3856C11.5941 18.9841 11.9217 18.6566 12.3234 18.6566H14.6769C15.0785 18.6566 15.4059 18.9841 15.4059 19.3856V25.27C15.4059 25.9505 15.9576 26.5025 16.6384 26.5025H20.6286C22.3903 26.5025 23.8226 25.0703 23.8226 23.3087V16.3006C24.524 16.2704 25.1811 15.982 25.6808 15.4823L25.6809 15.4822C26.7726 14.3901 26.7729 12.6144 25.6825 11.5217L25.6825 11.5217C25.6824 11.5216 25.6823 11.5215 25.6822 11.5214L25.6822 11.5213L25.6821 11.5213L25.6821 11.5213C25.6815 11.5207 25.6809 11.5201 25.6802 11.5194L25.6802 11.5194ZM25.6802 11.5194C25.6667 11.506 25.6433 11.4844 25.6119 11.4629L25.3371 11.8625L25.3297 11.8734L25.6821 11.5213C25.6815 11.5207 25.6809 11.5201 25.6802 11.5194ZM25.6825 11.5217L25.679 11.5252L25.6821 11.5214C25.6823 11.5215 25.6824 11.5216 25.6825 11.5217ZM23.9376 13.7395L23.9367 13.7405C23.9058 13.7716 23.869 13.7962 23.8285 13.813C23.788 13.8298 23.7446 13.8384 23.7007 13.8383H23.6996H22.5901C21.9094 13.8383 21.3576 14.39 21.3576 15.0708V23.3087C21.3576 23.7101 21.0302 24.0375 20.6286 24.0375H17.8709V19.3856C17.8709 17.6241 16.4386 16.1916 14.6768 16.1916H12.3234C10.5617 16.1916 9.12921 17.6241 9.12921 19.3856V24.0375H6.37155C5.96998 24.0375 5.64247 23.71 5.64247 23.3087V15.0708C5.64247 14.39 5.09068 13.8383 4.40998 13.8383H3.33486C3.32171 13.8376 3.30853 13.8371 3.29534 13.8368L3.29398 13.8368C3.20445 13.8352 3.12383 13.8005 3.06286 13.7395L3.06258 13.7392C2.93259 13.6092 2.93155 13.3969 3.05999 13.2655C3.06294 13.2626 3.06579 13.2597 3.06854 13.2568L13.2621 3.0637L13.2633 3.06251C13.2941 3.03149 13.3308 3.00689 13.3712 2.99015C13.4116 2.97341 13.4549 2.96486 13.4986 2.96499H13.5002C13.5909 2.96499 13.6737 2.99925 13.7381 3.06363L13.7381 3.06369L23.9345 13.2598L23.9344 13.2599L23.9413 13.2665C24.0687 13.3984 24.067 13.6101 23.9376 13.7395ZM3.14127 13.1608C3.14822 13.1488 3.14292 13.1599 3.12887 13.181C3.13529 13.171 3.13962 13.1636 3.14127 13.1608Z" fill="#2D79BE" stroke="#2D79BE"/>
          </svg>
          Начать новую игру
        </button>
      </div>

      <div className="monster">
        <img src="img/monster.png" />
      </div>

      <div class="fireworks">
        <svg class="firework-1" width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.48 5.2628C44.48 4.41394 45.1591 3.73486 46.008 3.73486C46.8568 3.73486 47.5359 4.41395 47.5359 5.14962L46.008 27.7291L44.48 5.2628Z" fill="white" class="svg-firework-1"></path>
          <path d="M47.5359 94.2793C47.5359 95.1282 46.8568 95.8073 46.008 95.8073C45.1591 95.8073 44.48 95.1282 44.48 94.3925L46.008 71.813L47.5359 94.2793Z" fill="white" class="svg-firework-2"></path>
          <path d="M1.41487 48.2715L23.9944 49.7994L1.47147 51.3274C0.679203 51.3274 0.000116581 50.6483 0.000116581 49.7994C0.000116581 48.9506 0.622609 48.2715 1.41487 48.2715Z" fill="white" class="svg-firework-3"></path>
          <path d="M90.6009 51.2707L68.078 49.7428L90.5443 48.2148C91.3932 48.2148 92.0723 48.8939 92.0723 49.7428C92.0723 50.5916 91.3932 51.2707 90.6009 51.2707Z" fill="white" class="svg-firework-4"></path>
          <path d="M63.664 32.1431L74.8689 19.2971C75.0953 19.0707 75.3782 18.9575 75.6612 18.9575C75.9441 18.9575 76.2837 19.0707 76.4534 19.2971C76.6798 19.5234 76.793 19.8064 76.793 20.0893C76.793 20.3723 76.6798 20.6552 76.51 20.825L63.664 32.1431Z" fill="white" class="svg-firework-5"></path>
          <path d="M15.5624 19.75C15.5624 19.467 15.6756 19.1841 15.9019 18.9577C16.1283 18.7313 16.4112 18.6182 16.6942 18.6182C16.9771 18.6182 17.3167 18.7313 17.4298 18.9011L28.5781 31.9169L15.8453 20.5422C15.6755 20.3159 15.5624 20.0329 15.5624 19.75Z" fill="white" class="svg-firework-6"></path>
          <path d="M27.9556 66.9463L16.4112 79.5093C16.1848 79.7357 15.9018 79.8489 15.6189 79.8489C15.2794 79.8489 14.9964 79.7357 14.77 79.5093C14.3173 79.0566 14.3173 78.3209 14.7134 77.9248L27.9556 66.9463Z" fill="white" class="svg-firework-7"></path>
          <path d="M75.4348 81.2636C75.2084 81.4899 74.9255 81.5465 74.6425 81.5465C74.303 81.5465 74.02 81.4333 73.8502 81.2636L63.0415 67.9648L75.4914 79.6224C75.8875 80.1318 75.8875 80.8108 75.4348 81.2636Z" fill="white" class="svg-firework-8"></path>
          <path d="M55.2886 27.6726C55.4017 27.4462 55.5715 27.333 55.7979 27.333C55.8545 27.333 55.9677 27.333 56.0242 27.3896C56.3072 27.5028 56.4204 27.8423 56.3638 28.0687L52.6288 35.3688L55.2886 27.6726Z" fill="white" class="svg-firework-9"></path>
          <path d="M58.2314 0.39613C58.288 0.169769 58.5144 0 58.7407 0C58.7973 0 58.8539 0 58.9105 0C59.0237 0.0565903 59.1935 0.11318 59.2501 0.282951C59.3066 0.396132 59.3066 0.565902 59.3066 0.622492L56.3074 8.31877L58.2314 0.39613Z" fill="white" class="svg-firework-10"></path>
          <path d="M21.5044 85.9604L17.8826 93.3172C17.7694 93.487 17.5997 93.6001 17.4299 93.6001C17.3167 93.6001 17.2601 93.6001 17.1469 93.5436C17.0338 93.487 16.9206 93.3738 16.864 93.204C16.8074 93.0342 16.864 92.9211 16.864 92.8079L21.5044 85.9604Z" fill="white" class="svg-firework-11"></path>
          <path d="M1.41462 23.7678C1.5278 23.598 1.69757 23.4849 1.92393 23.4849C2.03711 23.4849 2.0937 23.4849 2.15029 23.5415L9.16748 27.8423L1.69757 24.5035C1.35803 24.3903 1.30144 24.0508 1.41462 23.7678Z" fill="white" class="svg-firework-12"></path>
          <path d="M95.2981 79.5091C95.1849 79.6788 95.0151 79.792 94.7888 79.792C94.6756 79.792 94.619 79.792 94.5624 79.7354L87.5452 75.4346L95.0151 78.7168C95.3547 78.8866 95.4113 79.2261 95.2981 79.5091Z" fill="white" class="svg-firework-13"></path>
          <path d="M35.1991 27.7856C35.2557 27.729 35.3689 27.729 35.4254 27.729C35.6518 27.729 35.8216 27.8422 35.8782 27.9554L39.1604 35.5385L34.9727 28.5213C34.9161 28.4081 34.9161 28.2383 34.9161 28.1251C34.9727 27.9554 35.0293 27.8422 35.1991 27.7856Z" fill="white" class="svg-firework-14"></path>
          <path d="M22.8059 42.4993C22.7493 42.3861 22.7493 42.2163 22.7493 42.1032C22.8059 41.8768 23.0323 41.707 23.2587 41.707C23.3152 41.707 23.3718 41.707 23.3718 41.707L31.0681 44.7063L23.0889 42.7822C22.9757 42.7257 22.8625 42.6691 22.8059 42.4993Z" fill="white" class="svg-firework-15"></path>
          <path d="M24.7299 60.6647C24.6733 60.7213 24.5601 60.7213 24.5035 60.7213C24.2772 60.7213 24.1074 60.6081 23.9942 60.4384C23.881 60.1554 23.9942 59.8159 24.164 59.7027L31.7471 56.4771L24.7299 60.6647Z" fill="white" class="svg-firework-16"></path>
          <path d="M40.2922 64.3999L38.0286 72.266C37.972 72.4923 37.7457 72.6055 37.5193 72.6055C37.4627 72.6055 37.4061 72.6055 37.3495 72.5489C37.0666 72.4357 36.8968 72.1528 37.01 71.8698L40.2922 64.3999Z" fill="white" class="svg-firework-17"></path>
          <path d="M55.232 72.3791C55.1754 72.4357 55.1188 72.4357 55.0056 72.4357C54.7793 72.4357 54.6095 72.3225 54.4963 72.1528L51.78 64.3999L55.4583 71.7001C55.6847 71.9264 55.5149 72.266 55.232 72.3791Z" fill="white" class="svg-firework-18"></path>
          <path d="M68.5308 58.9105C68.5874 59.0237 68.5874 59.1935 68.5308 59.3067C68.4742 59.533 68.2478 59.6462 68.0215 59.6462C67.9649 59.6462 67.9083 59.6462 67.8517 59.6462L60.4384 56.0244L68.1913 58.6276C68.361 58.6842 68.4742 58.7407 68.5308 58.9105Z" fill="white" class="svg-firework-19"></path>
          <path d="M67.8518 39.3301C68.0782 39.3301 68.2479 39.4433 68.3611 39.6696C68.4177 39.7828 68.4177 39.9526 68.3611 40.0658C68.3045 40.1789 68.1914 40.2921 68.1348 40.3487L60.4385 43.348L67.5689 39.3867C67.682 39.3867 67.7386 39.3301 67.8518 39.3301Z" fill="white" class="svg-firework-20"></path>
          <path d="M89.1296 64.9659C89.1296 65.2488 88.9033 65.4752 88.6203 65.4752C88.3374 65.4752 88.111 65.2488 88.111 64.9659C88.111 64.6829 88.3374 64.4565 88.6203 64.4565C88.9033 64.4565 89.1296 64.6829 89.1296 64.9659Z" fill="white" class="svg-firework-21"></path>
          <path d="M78.8868 37.1233C77.9248 37.1233 77.1325 36.3311 77.1325 35.369C77.1325 34.407 77.9248 33.6147 78.8868 33.6147C79.8488 33.6147 80.6411 34.407 80.6411 35.369C80.5845 36.3311 79.7923 37.1233 78.8868 37.1233Z" fill="white" class="svg-firework-22"></path>
          <path d="M64.8525 16.5811C64.7393 16.5811 64.6261 16.468 64.6261 16.3548C64.6261 16.2416 64.7393 16.1284 64.8525 16.1284C64.9657 16.1284 65.0789 16.2416 65.0789 16.3548C65.0789 16.468 64.9657 16.5811 64.8525 16.5811Z" fill="white" class="svg-firework-23"></path>
          <path d="M32.4829 19.5239C31.9736 19.5239 31.6341 19.1277 31.6341 18.675C31.6341 18.1657 32.0302 17.8262 32.4829 17.8262C32.9922 17.8262 33.3318 18.2223 33.3318 18.675C33.3318 19.1277 32.9357 19.5239 32.4829 19.5239Z" fill="white" class="svg-firework-24"></path>
          <path d="M9.7901 40.0092C9.62033 40.0092 9.45056 39.8394 9.45056 39.6696C9.45056 39.4999 9.62033 39.3301 9.7901 39.3301C9.95987 39.3301 10.1296 39.4999 10.1296 39.6696C10.1296 39.896 9.95987 40.0092 9.7901 40.0092Z" fill="white" class="svg-firework-25"></path>
          <path d="M15.6756 66.8329C15.6756 66.7197 15.7322 66.6631 15.8454 66.6631C15.9585 66.6631 16.0151 66.7197 16.0151 66.8329C16.0151 66.946 15.9585 67.0026 15.8454 67.0026C15.7322 67.0026 15.6756 66.8894 15.6756 66.8329Z" fill="white" class="svg-firework-26"></path>
          <path d="M30.7852 85.2817C32.2 85.2817 33.3318 86.4135 33.3318 87.8283C33.3318 89.2431 32.2 90.3749 30.7852 90.3749C29.3705 90.3749 28.2387 89.2431 28.2387 87.8283C28.2387 86.4135 29.3705 85.2817 30.7852 85.2817Z" fill="white" class="svg-firework-27"></path>
          <path d="M57.609 84.376C57.6656 84.376 57.7788 84.4326 57.7788 84.5457C57.7788 84.6023 57.7222 84.7155 57.609 84.7155C57.4959 84.7155 57.4393 84.6589 57.4393 84.5457C57.4393 84.4326 57.4959 84.376 57.609 84.376Z" fill="white" class="svg-firework-28"></path>
          <path d="M6.45138 60.0986C6.90411 60.0986 7.24365 60.4382 7.24365 60.8909C7.24365 61.3436 6.90411 61.6832 6.45138 61.6832C5.99866 61.6832 5.65912 61.3436 5.65912 60.8909C5.65912 60.4382 5.99866 60.0986 6.45138 60.0986Z" fill="white" class="svg-firework-29"></path>
        </svg>
        <svg class="firework-2" width="131" height="131" viewBox="0 0 131 131" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M69.4745 7.29061C69.4745 6.13551 68.5505 5.21143 67.3954 5.21143C66.2402 5.21143 65.3162 6.13551 65.3162 7.1366L67.3954 37.8624L69.4745 7.29061Z" fill="#FBEA14" class="svg-firework-1"></path>
          <path d="M65.3162 128.423C65.3162 129.578 66.2402 130.502 67.3954 130.502C68.5505 130.502 69.4745 129.578 69.4745 128.577L67.3954 97.8511L65.3162 128.423Z" fill="#FBEA14" class="svg-firework-2"></path>
          <path d="M128.077 65.8159L97.3511 67.8951L128 69.9743C129.078 69.9743 130.002 69.0502 130.002 67.8951C130.002 66.74 129.155 65.8159 128.077 65.8159Z" fill="#FBEA14" class="svg-firework-3"></path>
          <path d="M6.71385 69.8971L37.3627 67.818L6.79086 65.7388C5.63575 65.7388 4.71167 66.6629 4.71167 67.818C4.71167 68.9731 5.63575 69.8971 6.71385 69.8971Z" fill="#FBEA14" class="svg-firework-4"></path>
          <path d="M43.3693 43.8689L28.1219 26.3883C27.8139 26.0803 27.4288 25.9263 27.0438 25.9263C26.6588 25.9263 26.1967 26.0803 25.9657 26.3883C25.6577 26.6963 25.5037 27.0814 25.5037 27.4664C25.5037 27.8514 25.6577 28.2365 25.8887 28.4675L43.3693 43.8689Z" fill="#FBEA14" class="svg-firework-5"></path>
          <path d="M108.825 27.0045C108.825 26.6195 108.671 26.2344 108.363 25.9264C108.055 25.6184 107.67 25.4644 107.285 25.4644C106.9 25.4644 106.438 25.6184 106.284 25.8494L91.1135 43.561L108.44 28.0826C108.671 27.7746 108.825 27.3895 108.825 27.0045Z" fill="#FBEA14" class="svg-firework-6"></path>
          <path d="M91.9607 91.2285L107.67 108.324C107.978 108.632 108.363 108.786 108.748 108.786C109.21 108.786 109.595 108.632 109.903 108.324C110.519 107.708 110.519 106.707 109.98 106.168L91.9607 91.2285Z" fill="#FBEA14" class="svg-firework-7"></path>
          <path d="M27.3518 110.711C27.6598 111.019 28.0449 111.096 28.4299 111.096C28.8919 111.096 29.277 110.942 29.508 110.711L44.2163 92.6143L27.2748 108.478C26.7357 109.171 26.7357 110.095 27.3518 110.711Z" fill="#FBEA14" class="svg-firework-8"></path>
          <path d="M54.7663 37.7853C54.6123 37.4773 54.3813 37.3232 54.0733 37.3232C53.9963 37.3232 53.8422 37.3232 53.7652 37.4003C53.3802 37.5543 53.2262 38.0163 53.3032 38.3243L58.3857 48.2582L54.7663 37.7853Z" fill="#FBEA14" class="svg-firework-9"></path>
          <path d="M50.7617 0.667953C50.6847 0.359925 50.3767 0.128906 50.0687 0.128906C49.9916 0.128906 49.9146 0.128906 49.8376 0.128906C49.6836 0.205913 49.4526 0.28292 49.3756 0.513942C49.2986 0.667956 49.2986 0.898976 49.2986 0.975983L53.38 11.4489L50.7617 0.667953Z" fill="#FBEA14" class="svg-firework-10"></path>
          <path d="M100.739 117.103L105.668 127.113C105.822 127.344 106.053 127.498 106.284 127.498C106.438 127.498 106.515 127.499 106.669 127.422C106.823 127.344 106.977 127.19 107.054 126.959C107.131 126.728 107.054 126.574 107.054 126.42L100.739 117.103Z" fill="#FBEA14" class="svg-firework-11"></path>
          <path d="M128.077 32.4719C127.923 32.2409 127.692 32.0869 127.384 32.0869C127.23 32.0869 127.153 32.0869 127.076 32.1639L117.527 38.0165L127.692 33.473C128.154 33.319 128.231 32.857 128.077 32.4719Z" fill="#FBEA14" class="svg-firework-12"></path>
          <path d="M0.322085 108.324C0.476099 108.555 0.70712 108.709 1.01515 108.709C1.16916 108.709 1.24617 108.709 1.32318 108.632L10.8721 102.779L0.70712 107.246C0.245078 107.477 0.168071 107.939 0.322085 108.324Z" fill="#FBEA14" class="svg-firework-13"></path>
          <path d="M82.1039 37.9393C82.0269 37.8623 81.8729 37.8623 81.7958 37.8623C81.4878 37.8623 81.2568 38.0163 81.1798 38.1703L76.7134 48.4893L82.4119 38.9404C82.4889 38.7864 82.4889 38.5554 82.4889 38.4014C82.4119 38.1703 82.3349 38.0163 82.1039 37.9393Z" fill="#FBEA14" class="svg-firework-14"></path>
          <path d="M98.9681 57.9614C99.0451 57.8074 99.0451 57.5764 99.0451 57.4223C98.9681 57.1143 98.6601 56.8833 98.3521 56.8833C98.2751 56.8833 98.1981 56.8833 98.1981 56.8833L87.7251 60.9647L98.5831 58.3464C98.7371 58.2694 98.8911 58.1924 98.9681 57.9614Z" fill="#FBEA14" class="svg-firework-15"></path>
          <path d="M96.3501 82.6805C96.4272 82.7575 96.5812 82.7575 96.6582 82.7575C96.9662 82.7575 97.1972 82.6034 97.3512 82.3724C97.5052 81.9874 97.3512 81.5253 97.1202 81.3713L86.8013 76.9819L96.3501 82.6805Z" fill="#FBEA14" class="svg-firework-16"></path>
          <path d="M75.1731 87.7632L78.2534 98.4672C78.3304 98.7752 78.6384 98.9292 78.9464 98.9292C79.0234 98.9292 79.1005 98.9292 79.1775 98.8522C79.5625 98.6982 79.7935 98.3131 79.6395 97.9281L75.1731 87.7632Z" fill="#FBEA14" class="svg-firework-17"></path>
          <path d="M54.8433 98.6212C54.9204 98.6982 54.9974 98.6982 55.1514 98.6982C55.4594 98.6982 55.6904 98.5442 55.8444 98.3131L59.5408 87.7632L54.5353 97.6971C54.2273 98.0051 54.4583 98.4672 54.8433 98.6212Z" fill="#FBEA14" class="svg-firework-18"></path>
          <path d="M36.7465 80.2931C36.6695 80.4471 36.6695 80.6781 36.7465 80.8321C36.8235 81.1402 37.1315 81.2942 37.4395 81.2942C37.5165 81.2942 37.5936 81.2942 37.6706 81.2942L47.7585 76.3657L37.2085 79.9081C36.9775 79.9851 36.8235 80.0621 36.7465 80.2931Z" fill="#FBEA14" class="svg-firework-19"></path>
          <path d="M37.6705 53.6489C37.3625 53.6489 37.1314 53.8029 36.9774 54.111C36.9004 54.265 36.9004 54.496 36.9774 54.65C37.0544 54.804 37.2085 54.958 37.2855 55.0351L47.7584 59.1164L38.0555 53.7259C37.9015 53.7259 37.8245 53.6489 37.6705 53.6489Z" fill="#FBEA14" class="svg-firework-20"></path>
          <path d="M8.71606 88.5329C8.71606 88.9179 9.02409 89.226 9.40913 89.226C9.79416 89.226 10.1022 88.9179 10.1022 88.5329C10.1022 88.1479 9.79416 87.8398 9.40913 87.8398C9.02409 87.8398 8.71606 88.1479 8.71606 88.5329Z" fill="#FBEA14" class="svg-firework-21"></path>
          <path d="M22.6543 50.6455C23.9634 50.6455 25.0415 49.5674 25.0415 48.2583C25.0415 46.9492 23.9634 45.8711 22.6543 45.8711C21.3452 45.8711 20.2671 46.9492 20.2671 48.2583C20.3441 49.5674 21.4222 50.6455 22.6543 50.6455Z" fill="#FBEA14" class="svg-firework-22"></path>
          <path d="M41.7514 22.6908C41.9051 22.6908 42.0589 22.537 42.0589 22.3832C42.0589 22.2295 41.9051 22.0757 41.7514 22.0757C41.5976 22.0757 41.4438 22.2295 41.4438 22.3832C41.4438 22.537 41.5976 22.6908 41.7514 22.6908Z" fill="#FBEA14" class="svg-firework-23"></path>
          <path d="M85.7999 26.6964C86.4929 26.6964 86.955 26.1574 86.955 25.5413C86.955 24.8483 86.4159 24.3862 85.7999 24.3862C85.1068 24.3862 84.6448 24.9253 84.6448 25.5413C84.6448 26.1574 85.1838 26.6964 85.7999 26.6964Z" fill="#FBEA14" class="svg-firework-24"></path>
          <path d="M116.68 54.573C116.911 54.573 117.142 54.342 117.142 54.111C117.142 53.88 116.911 53.6489 116.68 53.6489C116.449 53.6489 116.218 53.88 116.218 54.111C116.218 54.419 116.449 54.573 116.68 54.573Z" fill="#FBEA14" class="svg-firework-25"></path>
          <path d="M108.67 91.0739C108.67 90.9201 108.593 90.8433 108.44 90.8433C108.286 90.8433 108.209 90.9201 108.209 91.0739C108.209 91.2277 108.286 91.3046 108.44 91.3046C108.593 91.3046 108.67 91.1508 108.67 91.0739Z" fill="#FBEA14" class="svg-firework-26"></path>
          <path d="M88.1101 116.179C86.1849 116.179 84.6448 117.719 84.6448 119.644C84.6448 121.569 86.1849 123.109 88.1101 123.109C90.0353 123.109 91.5754 121.569 91.5754 119.644C91.5754 117.719 90.0353 116.179 88.1101 116.179Z" fill="#FBEA14" class="svg-firework-27"></path>
          <path d="M51.6083 114.946C51.5314 114.946 51.3777 115.023 51.3777 115.177C51.3777 115.254 51.4546 115.408 51.6083 115.408C51.7621 115.408 51.839 115.331 51.839 115.177C51.839 115.023 51.7621 114.946 51.6083 114.946Z" fill="#FBEA14" class="svg-firework-28"></path>
          <path d="M121.223 81.9106C120.607 81.9106 120.145 82.3727 120.145 82.9887C120.145 83.6048 120.607 84.0668 121.223 84.0668C121.839 84.0668 122.301 83.6048 122.301 82.9887C122.301 82.3727 121.839 81.9106 121.223 81.9106Z" fill="#FBEA14" class="svg-firework-29"></path>
        </svg>
        <svg class="firework-3" xmlns="http://www.w3.org/2000/svg" width="58" height="59" viewBox="0 0 58 59" fill="none">
          <path d="M27.2343 3.73699C27.2343 3.22768 27.6304 2.83154 28.1397 2.83154C28.649 2.83154 29.0452 3.22767 29.0452 3.6804L28.1397 17.3187L27.2343 3.73699Z" fill="white" class="svg-firework-1"></path>
          <path d="M29.1018 57.441C29.1018 57.9503 28.7057 58.3465 28.1964 58.3465C27.6871 58.3465 27.2909 57.9504 27.2909 57.4976L28.1964 43.8594L29.1018 57.441Z" fill="white" class="svg-firework-2"></path>
          <path d="M1.25922 29.6553L14.8975 30.5607L1.3158 31.4662C0.806486 31.4662 0.410368 31.07 0.410368 30.5607C0.353778 30.108 0.8065 29.6553 1.25922 29.6553Z" fill="white" class="svg-firework-3"></path>
          <path d="M55.0767 31.5228L41.4951 30.6174L55.0767 29.7119C55.586 29.7119 55.9822 30.108 55.9822 30.6174C55.9822 31.0701 55.5295 31.4662 55.0767 31.5228Z" fill="white" class="svg-firework-4"></path>
          <path d="M38.8353 19.9216L45.6261 12.1687C45.7393 12.0556 45.9091 11.9424 46.1354 11.9424C46.3052 11.9424 46.4749 11.999 46.6447 12.1687C46.7579 12.2819 46.8711 12.4517 46.8711 12.6781C46.8711 12.8478 46.8145 13.0176 46.7013 13.1308L38.8353 19.9216Z" fill="white" class="svg-firework-5"></path>
          <path d="M9.80442 12.452C9.80442 12.2823 9.86102 12.1125 10.0308 11.9427C10.144 11.8295 10.3137 11.7729 10.5401 11.7729C10.7099 11.7729 10.8796 11.8295 10.9928 11.9427L17.7271 19.8088L10.0308 12.9613C9.86102 12.7916 9.80442 12.6218 9.80442 12.452Z" fill="white" class="svg-firework-6"></path>
          <path d="M17.2744 40.9731L10.3138 48.5562C10.2006 48.6694 10.0308 48.726 9.86107 48.726C9.6913 48.726 9.46496 48.6694 9.35178 48.4996C9.06883 48.2167 9.06883 47.764 9.35178 47.5376L17.2744 40.9731Z" fill="white" class="svg-firework-7"></path>
          <path d="M45.909 49.5749C45.7958 49.6881 45.6261 49.7446 45.4563 49.7446C45.2865 49.7446 45.0602 49.6881 45.0036 49.5749L38.4391 41.5391L45.9656 48.5563C46.192 48.8958 46.192 49.3485 45.909 49.5749Z" fill="white" class="svg-firework-8"></path>
          <path d="M33.7986 17.262C33.8552 17.1488 33.9684 17.0356 34.0816 17.0356C34.1382 17.0356 34.1947 17.0356 34.1947 17.0356C34.3645 17.0922 34.4211 17.3186 34.3645 17.4318L32.1009 21.8458L33.7986 17.262Z" fill="white" class="svg-firework-9"></path>
          <path d="M35.5531 0.794233C35.6097 0.681052 35.7228 0.567871 35.8926 0.567871C35.9492 0.567871 35.9492 0.567871 36.0058 0.567871C36.0624 0.567871 36.1756 0.624463 36.1756 0.737644C36.2322 0.794234 36.2322 0.907415 36.2322 0.964006L34.4213 5.60441L35.5531 0.794233Z" fill="white" class="svg-firework-10"></path>
          <path d="M13.3699 52.4043L11.1629 56.8183C11.1063 56.9315 10.9931 56.9881 10.8799 56.9881C10.8233 56.9881 10.7667 56.9881 10.7101 56.9315C10.6535 56.8749 10.597 56.8183 10.5404 56.7052C10.5404 56.592 10.5404 56.5354 10.5404 56.4788L13.3699 52.4043Z" fill="white" class="svg-firework-11"></path>
          <path d="M1.25953 14.8851C1.31612 14.7719 1.4293 14.7153 1.54248 14.7153C1.59907 14.7153 1.65563 14.7153 1.65563 14.7153L5.8999 17.3185L1.37268 15.3378C1.2595 15.2812 1.14635 15.0549 1.25953 14.8851Z" fill="white" class="svg-firework-12"></path>
          <path d="M57.9062 48.4998C57.8497 48.613 57.7365 48.6696 57.6233 48.6696C57.5667 48.6696 57.5101 48.6696 57.5101 48.6696L53.2658 46.0664L57.7931 48.0471C57.9062 48.1602 58.0194 48.3866 57.9062 48.4998Z" fill="white" class="svg-firework-13"></path>
          <path d="M21.6321 17.3188C21.6886 17.3188 21.7452 17.2622 21.8018 17.2622C21.915 17.2622 22.0282 17.3188 22.0848 17.432L24.0654 22.0158L21.5189 17.7715C21.4623 17.7149 21.4623 17.6017 21.5189 17.5452C21.4623 17.432 21.5755 17.3754 21.6321 17.3188Z" fill="white" class="svg-firework-14"></path>
          <path d="M14.162 26.2032C14.1054 26.1466 14.1054 26.0334 14.162 25.9769C14.2186 25.8637 14.3317 25.7505 14.5015 25.7505C14.5581 25.7505 14.5581 25.7505 14.5581 25.7505L19.1985 27.5614L14.3883 26.4296C14.2751 26.3164 14.2186 26.2598 14.162 26.2032Z" fill="white" class="svg-firework-15"></path>
          <path d="M15.3505 37.1252C15.2939 37.1252 15.2373 37.1818 15.1807 37.1818C15.0675 37.1818 14.9543 37.1252 14.8977 37.0121C14.8412 36.8423 14.8977 36.6725 15.0109 36.5593L19.5947 34.6353L15.3505 37.1252Z" fill="white" class="svg-firework-16"></path>
          <path d="M24.7444 39.4453L23.3862 44.1989C23.3296 44.3121 23.2164 44.4253 23.0467 44.4253C22.9901 44.4253 22.9901 44.4253 22.9335 44.4253C22.7637 44.3687 22.6505 44.1989 22.7071 44.0291L24.7444 39.4453Z" fill="white" class="svg-firework-17"></path>
          <path d="M33.7424 44.2554C33.6858 44.2554 33.6292 44.2554 33.6292 44.2554C33.516 44.2554 33.4028 44.1988 33.3462 44.0857L31.7051 39.3887L33.9121 43.8027C33.9687 43.9725 33.9121 44.1422 33.7424 44.2554Z" fill="white" class="svg-firework-18"></path>
          <path d="M41.7781 36.1064C41.8347 36.1629 41.8347 36.2761 41.7781 36.3327C41.7215 36.4459 41.6083 36.5591 41.4952 36.5591C41.4386 36.5591 41.382 36.5591 41.382 36.5591L36.9114 34.3521L41.6084 35.9366C41.6649 35.9366 41.7215 35.9932 41.7781 36.1064Z" fill="white" class="svg-firework-19"></path>
          <path d="M41.3255 24.2793C41.4387 24.2793 41.5518 24.3359 41.6084 24.4491C41.665 24.5057 41.665 24.6188 41.6084 24.6754C41.5518 24.732 41.4952 24.8452 41.4952 24.8452L36.8548 26.6561L41.1557 24.2793C41.2123 24.3359 41.2689 24.2793 41.3255 24.2793Z" fill="white" class="svg-firework-20"></path>
          <path d="M54.228 39.7849C54.228 39.9546 54.1148 40.1244 53.8885 40.1244C53.7187 40.1244 53.5489 40.0112 53.5489 39.7849C53.5489 39.6151 53.6621 39.4453 53.8885 39.4453C54.0583 39.4453 54.228 39.6151 54.228 39.7849Z" fill="white" class="svg-firework-21"></path>
          <path d="M48.0029 22.921C47.437 22.921 46.9842 22.4683 46.9842 21.9024C46.9842 21.3365 47.437 20.8838 48.0029 20.8838C48.5688 20.8838 49.0215 21.3365 49.0215 21.9024C49.0215 22.4683 48.5688 22.921 48.0029 22.921Z" fill="white" class="svg-firework-22"></path>
          <path d="M39.5143 10.5843C39.4577 10.5843 39.4011 10.5277 39.4011 10.4711C39.4011 10.4145 39.4577 10.3579 39.5143 10.3579C39.5709 10.3579 39.6275 10.4145 39.6275 10.4711C39.684 10.5277 39.6275 10.5843 39.5143 10.5843Z" fill="white" class="svg-firework-23"></path>
          <path d="M19.9909 12.3385C19.708 12.3385 19.4816 12.1121 19.4816 11.8291C19.4816 11.5462 19.708 11.3198 19.9909 11.3198C20.2739 11.3198 20.5002 11.5462 20.5002 11.8291C20.5002 12.1121 20.2739 12.3385 19.9909 12.3385Z" fill="white" class="svg-firework-24"></path>
          <path d="M6.29584 24.732C6.18266 24.732 6.0695 24.6188 6.0695 24.5057C6.0695 24.3925 6.18266 24.2793 6.29584 24.2793C6.40902 24.2793 6.52222 24.3925 6.52222 24.5057C6.52222 24.6188 6.40902 24.732 6.29584 24.732Z" fill="white" class="svg-firework-25"></path>
          <path d="M9.86103 40.8602C9.86103 40.8037 9.91762 40.7471 9.97421 40.7471C10.0308 40.7471 10.0874 40.8037 10.0874 40.8602C10.0874 40.9168 10.0308 40.9734 9.97421 40.9734C9.91762 40.9734 9.86103 40.9168 9.86103 40.8602Z" fill="white" class="svg-firework-26"></path>
          <path d="M18.9723 52.0083C19.8212 52.0083 20.5002 52.6874 20.5002 53.5362C20.5002 54.3851 19.8212 55.0642 18.9723 55.0642C18.1234 55.0642 17.4444 54.3851 17.4444 53.5362C17.4444 52.6874 18.1234 52.0083 18.9723 52.0083Z" fill="white" class="svg-firework-27"></path>
          <path d="M35.1568 51.499C35.2134 51.499 35.27 51.5556 35.27 51.6122C35.27 51.6688 35.2134 51.7254 35.1568 51.7254C35.1002 51.7254 35.0436 51.6688 35.0436 51.6122C35.0436 51.5556 35.1002 51.499 35.1568 51.499Z" fill="white" class="svg-firework-28"></path>
          <path d="M4.25871 36.7856C4.54166 36.7856 4.71143 37.012 4.71143 37.2384C4.71143 37.5213 4.48507 37.6911 4.25871 37.6911C3.97576 37.6911 3.806 37.4647 3.806 37.2384C3.806 37.012 4.03235 36.7856 4.25871 36.7856Z" fill="white" class="svg-firework-29"></path>
        </svg>
        <svg  class="firework-4" xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
          <path d="M15.173 1.83988C15.173 1.55693 15.3994 1.33057 15.6823 1.33057C15.9653 1.33057 16.1917 1.55693 16.1917 1.78329L15.6823 9.30979L15.173 1.83988Z" fill="white" class="svg-firework-1"></path>
          <path d="M16.1917 31.5495C16.1917 31.8325 15.9653 32.0588 15.6823 32.0588C15.3994 32.0588 15.173 31.8325 15.173 31.6061L15.6823 24.0796L16.1917 31.5495Z" fill="white" class="svg-firework-2"></path>
          <path d="M0.798943 16.1572L8.32544 16.6665L0.798943 17.1759C0.515991 17.1759 0.289634 16.9495 0.289634 16.6665C0.346224 16.3836 0.572582 16.1572 0.798943 16.1572Z" fill="white" class="svg-firework-3"></path>
          <path d="M30.5654 17.1759L23.0389 16.6665L30.5654 16.1572C30.8483 16.1572 31.0747 16.3836 31.0747 16.6665C31.0747 16.9495 30.8483 17.1759 30.5654 17.1759Z" fill="white" class="svg-firework-4"></path>
          <path d="M21.5676 10.7812L25.3026 6.48037C25.3592 6.42378 25.4724 6.36719 25.5856 6.36719C25.6987 6.36719 25.8119 6.42378 25.8685 6.48037C25.9251 6.53696 25.9817 6.65014 25.9817 6.76332C25.9817 6.8765 25.9251 6.93309 25.8685 6.98968L21.5676 10.7812Z" fill="white" class="svg-firework-5"></path>
          <path d="M5.55246 6.65004C5.55246 6.53686 5.60905 6.48027 5.66564 6.36709C5.72223 6.3105 5.83541 6.25391 5.94859 6.25391C6.06177 6.25391 6.17496 6.3105 6.17496 6.36709L9.90991 10.7245L5.66564 6.93299C5.55246 6.8764 5.55246 6.76322 5.55246 6.65004Z" fill="white" class="svg-firework-6"></path>
          <path d="M9.68359 22.4385L5.83545 26.6262C5.77886 26.6827 5.66568 26.7393 5.5525 26.7393C5.43932 26.7393 5.32614 26.6827 5.26955 26.6262C5.09978 26.4564 5.09978 26.23 5.26955 26.1168L9.68359 22.4385Z" fill="white" class="svg-firework-7"></path>
          <path d="M25.529 27.1924C25.4724 27.2489 25.3593 27.3055 25.2461 27.3055C25.1329 27.3055 25.0197 27.2489 24.9631 27.1924L21.3413 22.7783L25.4724 26.683C25.6422 26.7962 25.6422 27.0226 25.529 27.1924Z" fill="white" class="svg-firework-8"></path>
          <path d="M18.7947 9.30947C18.8513 9.25288 18.9079 9.19629 18.9645 9.19629H19.0211C19.1343 9.25288 19.1343 9.36606 19.1343 9.42265L17.8893 11.856L18.7947 9.30947Z" fill="white" class="svg-firework-9"></path>
          <path d="M19.7567 0.198628C19.7567 0.142038 19.8698 0.0854492 19.9264 0.0854492H19.983C20.0396 0.0854492 20.0962 0.142038 20.0962 0.198628C20.0962 0.255218 20.0962 0.311807 20.0962 0.311807L19.0776 2.85837L19.7567 0.198628Z" fill="white" class="svg-firework-10"></path>
          <path d="M7.5332 28.7202L6.3448 31.1536C6.28821 31.2102 6.23163 31.2668 6.17504 31.2668C6.11845 31.2668 6.11844 31.2668 6.06185 31.2668C6.00526 31.2668 6.00526 31.2102 5.94867 31.1536C5.94867 31.097 5.94867 31.0404 5.94867 31.0404L7.5332 28.7202Z" fill="white" class="svg-firework-11"></path>
          <path d="M0.798898 8.0082C0.855488 7.95161 0.912071 7.89502 0.968662 7.89502C1.02525 7.89502 1.02526 7.89502 1.02526 7.89502L3.34546 9.30978L0.855491 8.17797C0.798901 8.23456 0.798898 8.12138 0.798898 8.0082Z" fill="white" class="svg-firework-12"></path>
          <path d="M32.1499 26.5696C32.0933 26.6262 32.0367 26.6828 31.9801 26.6828C31.9235 26.6828 31.9235 26.6828 31.9235 26.6828L29.6033 25.2681L32.0933 26.3433C32.1499 26.3999 32.1499 26.513 32.1499 26.5696Z" fill="white" class="svg-firework-13"></path>
          <path d="M12.0605 9.36621H12.1171C12.1737 9.36621 12.2303 9.4228 12.2868 9.4228L13.3621 11.9694L11.9473 9.64916C11.9473 9.59257 11.9473 9.53598 11.9473 9.53598C12.0039 9.4228 12.0605 9.36621 12.0605 9.36621Z" fill="white" class="svg-firework-14"></path>
          <path d="M7.92946 14.2332C7.92946 14.1766 7.92946 14.12 7.92946 14.12C7.92946 14.0634 8.04265 14.0068 8.09924 14.0068H8.15583L10.7024 15.0255L8.04264 14.403C7.98605 14.3464 7.98605 14.2898 7.92946 14.2332Z" fill="white" class="svg-firework-15"></path>
          <path d="M8.60855 20.2883H8.55197C8.49538 20.2883 8.43879 20.2317 8.3822 20.1751C8.32561 20.0619 8.3822 19.9488 8.43879 19.9488L10.9854 18.8735L8.60855 20.2883Z" fill="white" class="svg-firework-16"></path>
          <path d="M13.8147 21.5332L13.079 24.1364C13.079 24.1929 12.9658 24.2495 12.9092 24.2495H12.8527C12.7395 24.1929 12.6829 24.1364 12.7395 24.0232L13.8147 21.5332Z" fill="white" class="svg-firework-17"></path>
          <path d="M18.7948 24.1929H18.7382C18.6816 24.1929 18.625 24.1363 18.5684 24.0797L17.663 21.4766L18.908 23.9099C18.908 24.0797 18.8514 24.1929 18.7948 24.1929Z" fill="white" class="svg-firework-18"></path>
          <path d="M23.2087 19.7223C23.2087 19.7789 23.2087 19.8355 23.2087 19.8355C23.2087 19.8921 23.0956 19.9486 23.039 19.9486H22.9824L20.4924 18.7603L23.0956 19.6091C23.1522 19.6657 23.1521 19.6657 23.2087 19.7223Z" fill="white" class="svg-firework-19"></path>
          <path d="M22.9823 13.2144C23.0389 13.2144 23.0955 13.2709 23.1521 13.3275C23.1521 13.3841 23.1521 13.4407 23.1521 13.4407C23.1521 13.4973 23.0955 13.4973 23.0955 13.5539L20.5489 14.5725L22.9257 13.2709C22.9257 13.2144 22.9257 13.2144 22.9823 13.2144Z" fill="white" class="svg-firework-20"></path>
          <path d="M30.0562 21.7596C30.0562 21.8728 29.9996 21.9294 29.8864 21.9294C29.7732 21.9294 29.7166 21.8728 29.7166 21.7596C29.7166 21.6464 29.7732 21.5898 29.8864 21.5898C29.9996 21.5898 30.0562 21.6464 30.0562 21.7596Z" fill="white" class="svg-firework-21"></path>
          <path d="M26.6607 12.4785C26.3211 12.4785 26.0948 12.1955 26.0948 11.9126C26.0948 11.573 26.3777 11.3467 26.6607 11.3467C27.0002 11.3467 27.2266 11.6296 27.2266 11.9126C27.2266 12.1955 26.9436 12.4785 26.6607 12.4785Z" fill="white" class="svg-firework-22"></path>
          <path d="M21.9637 5.63125C21.9071 5.63125 21.9071 5.57466 21.9071 5.57466C21.9071 5.51807 21.9637 5.51807 21.9637 5.51807C22.0203 5.51807 22.0203 5.57466 22.0203 5.57466C22.0203 5.57466 22.0203 5.63125 21.9637 5.63125Z" fill="white" class="svg-firework-23"></path>
          <path d="M11.1549 6.59325C10.9852 6.59325 10.872 6.48007 10.872 6.3103C10.872 6.14052 10.9852 6.02734 11.1549 6.02734C11.3247 6.02734 11.4379 6.14052 11.4379 6.3103C11.4945 6.48007 11.3247 6.59325 11.1549 6.59325Z" fill="white" class="svg-firework-24"></path>
          <path d="M3.62852 13.4407C3.57193 13.4407 3.51533 13.3841 3.51533 13.3275C3.51533 13.2709 3.57193 13.2144 3.62852 13.2144C3.68511 13.2144 3.7417 13.2709 3.7417 13.3275C3.7417 13.3841 3.68511 13.4407 3.62852 13.4407Z" fill="white" class="svg-firework-25"></path>
          <path d="M5.55259 22.3818C5.55259 22.3252 5.5526 22.3252 5.60919 22.3252C5.66578 22.3252 5.66577 22.3252 5.66577 22.3818C5.66577 22.4384 5.66578 22.4384 5.60919 22.4384L5.55259 22.3818Z" fill="white" class="svg-firework-26"></path>
          <path d="M10.5891 28.5503C11.0419 28.5503 11.438 28.9464 11.438 29.3991C11.438 29.8519 11.0419 30.248 10.5891 30.248C10.1364 30.248 9.74028 29.8519 9.74028 29.3991C9.74028 28.8898 10.1364 28.5503 10.5891 28.5503Z" fill="white" class="svg-firework-27"></path>
          <path d="M19.5869 28.2109C19.6435 28.2675 19.5869 28.3241 19.5869 28.3241C19.5869 28.3241 19.5303 28.3241 19.5869 28.2109C19.5303 28.2675 19.5303 28.2109 19.5869 28.2109Z" fill="white" class="svg-firework-28"></path>
          <path d="M2.49683 20.1182C2.6666 20.1182 2.77979 20.2313 2.77979 20.4011C2.77979 20.5709 2.6666 20.6841 2.49683 20.6841C2.32706 20.6841 2.21388 20.5709 2.21388 20.4011C2.21388 20.2313 2.32706 20.1182 2.49683 20.1182Z" fill="white" class="svg-firework-29"></path>
        </svg>
        <svg class="firework-5" xmlns="http://www.w3.org/2000/svg" width="58" height="59" viewBox="0 0 58 59" fill="none">
          <path d="M27.2343 3.73699C27.2343 3.22768 27.6304 2.83154 28.1397 2.83154C28.649 2.83154 29.0452 3.22767 29.0452 3.6804L28.1397 17.3187L27.2343 3.73699Z" fill="white" class="svg-firework-1"></path>
          <path d="M29.1018 57.441C29.1018 57.9503 28.7057 58.3465 28.1964 58.3465C27.6871 58.3465 27.2909 57.9504 27.2909 57.4976L28.1964 43.8594L29.1018 57.441Z" fill="white" class="svg-firework-2"></path>
          <path d="M1.25922 29.6553L14.8975 30.5607L1.3158 31.4662C0.806486 31.4662 0.410368 31.07 0.410368 30.5607C0.353778 30.108 0.8065 29.6553 1.25922 29.6553Z" fill="white" class="svg-firework-3"></path>
          <path d="M55.0767 31.5228L41.4951 30.6174L55.0767 29.7119C55.586 29.7119 55.9822 30.108 55.9822 30.6174C55.9822 31.0701 55.5295 31.4662 55.0767 31.5228Z" fill="white" class="svg-firework-4"></path>
          <path d="M38.8353 19.9216L45.6261 12.1687C45.7393 12.0556 45.9091 11.9424 46.1354 11.9424C46.3052 11.9424 46.4749 11.999 46.6447 12.1687C46.7579 12.2819 46.8711 12.4517 46.8711 12.6781C46.8711 12.8478 46.8145 13.0176 46.7013 13.1308L38.8353 19.9216Z" fill="white" class="svg-firework-5"></path>
          <path d="M9.80442 12.452C9.80442 12.2823 9.86102 12.1125 10.0308 11.9427C10.144 11.8295 10.3137 11.7729 10.5401 11.7729C10.7099 11.7729 10.8796 11.8295 10.9928 11.9427L17.7271 19.8088L10.0308 12.9613C9.86102 12.7916 9.80442 12.6218 9.80442 12.452Z" fill="white" class="svg-firework-6"></path>
          <path d="M17.2744 40.9731L10.3138 48.5562C10.2006 48.6694 10.0308 48.726 9.86107 48.726C9.6913 48.726 9.46496 48.6694 9.35178 48.4996C9.06883 48.2167 9.06883 47.764 9.35178 47.5376L17.2744 40.9731Z" fill="white" class="svg-firework-7"></path>
          <path d="M45.909 49.5749C45.7958 49.6881 45.6261 49.7446 45.4563 49.7446C45.2865 49.7446 45.0602 49.6881 45.0036 49.5749L38.4391 41.5391L45.9656 48.5563C46.192 48.8958 46.192 49.3485 45.909 49.5749Z" fill="white" class="svg-firework-8"></path>
          <path d="M33.7986 17.262C33.8552 17.1488 33.9684 17.0356 34.0816 17.0356C34.1382 17.0356 34.1947 17.0356 34.1947 17.0356C34.3645 17.0922 34.4211 17.3186 34.3645 17.4318L32.1009 21.8458L33.7986 17.262Z" fill="white" class="svg-firework-9"></path>
          <path d="M35.5531 0.794233C35.6097 0.681052 35.7228 0.567871 35.8926 0.567871C35.9492 0.567871 35.9492 0.567871 36.0058 0.567871C36.0624 0.567871 36.1756 0.624463 36.1756 0.737644C36.2322 0.794234 36.2322 0.907415 36.2322 0.964006L34.4213 5.60441L35.5531 0.794233Z" fill="white" class="svg-firework-10"></path>
          <path d="M13.3699 52.4043L11.1629 56.8183C11.1063 56.9315 10.9931 56.9881 10.8799 56.9881C10.8233 56.9881 10.7667 56.9881 10.7101 56.9315C10.6535 56.8749 10.597 56.8183 10.5404 56.7052C10.5404 56.592 10.5404 56.5354 10.5404 56.4788L13.3699 52.4043Z" fill="white" class="svg-firework-11"></path>
          <path d="M1.25953 14.8851C1.31612 14.7719 1.4293 14.7153 1.54248 14.7153C1.59907 14.7153 1.65563 14.7153 1.65563 14.7153L5.8999 17.3185L1.37268 15.3378C1.2595 15.2812 1.14635 15.0549 1.25953 14.8851Z" fill="white" class="svg-firework-12"></path>
          <path d="M57.9062 48.4998C57.8497 48.613 57.7365 48.6696 57.6233 48.6696C57.5667 48.6696 57.5101 48.6696 57.5101 48.6696L53.2658 46.0664L57.7931 48.0471C57.9062 48.1602 58.0194 48.3866 57.9062 48.4998Z" fill="white" class="svg-firework-13"></path>
          <path d="M21.6321 17.3188C21.6886 17.3188 21.7452 17.2622 21.8018 17.2622C21.915 17.2622 22.0282 17.3188 22.0848 17.432L24.0654 22.0158L21.5189 17.7715C21.4623 17.7149 21.4623 17.6017 21.5189 17.5452C21.4623 17.432 21.5755 17.3754 21.6321 17.3188Z" fill="white" class="svg-firework-14"></path>
          <path d="M14.162 26.2032C14.1054 26.1466 14.1054 26.0334 14.162 25.9769C14.2186 25.8637 14.3317 25.7505 14.5015 25.7505C14.5581 25.7505 14.5581 25.7505 14.5581 25.7505L19.1985 27.5614L14.3883 26.4296C14.2751 26.3164 14.2186 26.2598 14.162 26.2032Z" fill="white" class="svg-firework-15"></path>
          <path d="M15.3505 37.1252C15.2939 37.1252 15.2373 37.1818 15.1807 37.1818C15.0675 37.1818 14.9543 37.1252 14.8977 37.0121C14.8412 36.8423 14.8977 36.6725 15.0109 36.5593L19.5947 34.6353L15.3505 37.1252Z" fill="white" class="svg-firework-16"></path>
          <path d="M24.7444 39.4453L23.3862 44.1989C23.3296 44.3121 23.2164 44.4253 23.0467 44.4253C22.9901 44.4253 22.9901 44.4253 22.9335 44.4253C22.7637 44.3687 22.6505 44.1989 22.7071 44.0291L24.7444 39.4453Z" fill="white" class="svg-firework-17"></path>
          <path d="M33.7424 44.2554C33.6858 44.2554 33.6292 44.2554 33.6292 44.2554C33.516 44.2554 33.4028 44.1988 33.3462 44.0857L31.7051 39.3887L33.9121 43.8027C33.9687 43.9725 33.9121 44.1422 33.7424 44.2554Z" fill="white" class="svg-firework-18"></path>
          <path d="M41.7781 36.1064C41.8347 36.1629 41.8347 36.2761 41.7781 36.3327C41.7215 36.4459 41.6083 36.5591 41.4952 36.5591C41.4386 36.5591 41.382 36.5591 41.382 36.5591L36.9114 34.3521L41.6084 35.9366C41.6649 35.9366 41.7215 35.9932 41.7781 36.1064Z" fill="white" class="svg-firework-19"></path>
          <path d="M41.3255 24.2793C41.4387 24.2793 41.5518 24.3359 41.6084 24.4491C41.665 24.5057 41.665 24.6188 41.6084 24.6754C41.5518 24.732 41.4952 24.8452 41.4952 24.8452L36.8548 26.6561L41.1557 24.2793C41.2123 24.3359 41.2689 24.2793 41.3255 24.2793Z" fill="white" class="svg-firework-20"></path>
          <path d="M54.228 39.7849C54.228 39.9546 54.1148 40.1244 53.8885 40.1244C53.7187 40.1244 53.5489 40.0112 53.5489 39.7849C53.5489 39.6151 53.6621 39.4453 53.8885 39.4453C54.0583 39.4453 54.228 39.6151 54.228 39.7849Z" fill="white" class="svg-firework-21"></path>
          <path d="M48.0029 22.921C47.437 22.921 46.9842 22.4683 46.9842 21.9024C46.9842 21.3365 47.437 20.8838 48.0029 20.8838C48.5688 20.8838 49.0215 21.3365 49.0215 21.9024C49.0215 22.4683 48.5688 22.921 48.0029 22.921Z" fill="white" class="svg-firework-22"></path>
          <path d="M39.5143 10.5843C39.4577 10.5843 39.4011 10.5277 39.4011 10.4711C39.4011 10.4145 39.4577 10.3579 39.5143 10.3579C39.5709 10.3579 39.6275 10.4145 39.6275 10.4711C39.684 10.5277 39.6275 10.5843 39.5143 10.5843Z" fill="white" class="svg-firework-23"></path>
          <path d="M19.9909 12.3385C19.708 12.3385 19.4816 12.1121 19.4816 11.8291C19.4816 11.5462 19.708 11.3198 19.9909 11.3198C20.2739 11.3198 20.5002 11.5462 20.5002 11.8291C20.5002 12.1121 20.2739 12.3385 19.9909 12.3385Z" fill="white" class="svg-firework-24"></path>
          <path d="M6.29584 24.732C6.18266 24.732 6.0695 24.6188 6.0695 24.5057C6.0695 24.3925 6.18266 24.2793 6.29584 24.2793C6.40902 24.2793 6.52222 24.3925 6.52222 24.5057C6.52222 24.6188 6.40902 24.732 6.29584 24.732Z" fill="white" class="svg-firework-25"></path>
          <path d="M9.86103 40.8602C9.86103 40.8037 9.91762 40.7471 9.97421 40.7471C10.0308 40.7471 10.0874 40.8037 10.0874 40.8602C10.0874 40.9168 10.0308 40.9734 9.97421 40.9734C9.91762 40.9734 9.86103 40.9168 9.86103 40.8602Z" fill="white" class="svg-firework-26"></path>
          <path d="M18.9723 52.0083C19.8212 52.0083 20.5002 52.6874 20.5002 53.5362C20.5002 54.3851 19.8212 55.0642 18.9723 55.0642C18.1234 55.0642 17.4444 54.3851 17.4444 53.5362C17.4444 52.6874 18.1234 52.0083 18.9723 52.0083Z" fill="white" class="svg-firework-27"></path>
          <path d="M35.1568 51.499C35.2134 51.499 35.27 51.5556 35.27 51.6122C35.27 51.6688 35.2134 51.7254 35.1568 51.7254C35.1002 51.7254 35.0436 51.6688 35.0436 51.6122C35.0436 51.5556 35.1002 51.499 35.1568 51.499Z" fill="white" class="svg-firework-28"></path>
          <path d="M4.25871 36.7856C4.54166 36.7856 4.71143 37.012 4.71143 37.2384C4.71143 37.5213 4.48507 37.6911 4.25871 37.6911C3.97576 37.6911 3.806 37.4647 3.806 37.2384C3.806 37.012 4.03235 36.7856 4.25871 36.7856Z" fill="white" class="svg-firework-29"></path>
        </svg>
        <svg class="firework-6" xmlns="http://www.w3.org/2000/svg" width="58" height="59" viewBox="0 0 58 59" fill="none">
          <path d="M27.2343 3.73699C27.2343 3.22768 27.6304 2.83154 28.1397 2.83154C28.649 2.83154 29.0452 3.22767 29.0452 3.6804L28.1397 17.3187L27.2343 3.73699Z" fill="white" class="svg-firework-1"></path>
          <path d="M29.1018 57.441C29.1018 57.9503 28.7057 58.3465 28.1964 58.3465C27.6871 58.3465 27.2909 57.9504 27.2909 57.4976L28.1964 43.8594L29.1018 57.441Z" fill="white" class="svg-firework-2"></path>
          <path d="M1.25922 29.6553L14.8975 30.5607L1.3158 31.4662C0.806486 31.4662 0.410368 31.07 0.410368 30.5607C0.353778 30.108 0.8065 29.6553 1.25922 29.6553Z" fill="white" class="svg-firework-3"></path>
          <path d="M55.0767 31.5228L41.4951 30.6174L55.0767 29.7119C55.586 29.7119 55.9822 30.108 55.9822 30.6174C55.9822 31.0701 55.5295 31.4662 55.0767 31.5228Z" fill="white" class="svg-firework-4"></path>
          <path d="M38.8353 19.9216L45.6261 12.1687C45.7393 12.0556 45.9091 11.9424 46.1354 11.9424C46.3052 11.9424 46.4749 11.999 46.6447 12.1687C46.7579 12.2819 46.8711 12.4517 46.8711 12.6781C46.8711 12.8478 46.8145 13.0176 46.7013 13.1308L38.8353 19.9216Z" fill="white" class="svg-firework-5"></path>
          <path d="M9.80442 12.452C9.80442 12.2823 9.86102 12.1125 10.0308 11.9427C10.144 11.8295 10.3137 11.7729 10.5401 11.7729C10.7099 11.7729 10.8796 11.8295 10.9928 11.9427L17.7271 19.8088L10.0308 12.9613C9.86102 12.7916 9.80442 12.6218 9.80442 12.452Z" fill="white" class="svg-firework-6"></path>
          <path d="M17.2744 40.9731L10.3138 48.5562C10.2006 48.6694 10.0308 48.726 9.86107 48.726C9.6913 48.726 9.46496 48.6694 9.35178 48.4996C9.06883 48.2167 9.06883 47.764 9.35178 47.5376L17.2744 40.9731Z" fill="white" class="svg-firework-7"></path>
          <path d="M45.909 49.5749C45.7958 49.6881 45.6261 49.7446 45.4563 49.7446C45.2865 49.7446 45.0602 49.6881 45.0036 49.5749L38.4391 41.5391L45.9656 48.5563C46.192 48.8958 46.192 49.3485 45.909 49.5749Z" fill="white" class="svg-firework-8"></path>
          <path d="M33.7986 17.262C33.8552 17.1488 33.9684 17.0356 34.0816 17.0356C34.1382 17.0356 34.1947 17.0356 34.1947 17.0356C34.3645 17.0922 34.4211 17.3186 34.3645 17.4318L32.1009 21.8458L33.7986 17.262Z" fill="white" class="svg-firework-9"></path>
          <path d="M35.5531 0.794233C35.6097 0.681052 35.7228 0.567871 35.8926 0.567871C35.9492 0.567871 35.9492 0.567871 36.0058 0.567871C36.0624 0.567871 36.1756 0.624463 36.1756 0.737644C36.2322 0.794234 36.2322 0.907415 36.2322 0.964006L34.4213 5.60441L35.5531 0.794233Z" fill="white" class="svg-firework-10"></path>
          <path d="M13.3699 52.4043L11.1629 56.8183C11.1063 56.9315 10.9931 56.9881 10.8799 56.9881C10.8233 56.9881 10.7667 56.9881 10.7101 56.9315C10.6535 56.8749 10.597 56.8183 10.5404 56.7052C10.5404 56.592 10.5404 56.5354 10.5404 56.4788L13.3699 52.4043Z" fill="white" class="svg-firework-11"></path>
          <path d="M1.25953 14.8851C1.31612 14.7719 1.4293 14.7153 1.54248 14.7153C1.59907 14.7153 1.65563 14.7153 1.65563 14.7153L5.8999 17.3185L1.37268 15.3378C1.2595 15.2812 1.14635 15.0549 1.25953 14.8851Z" fill="white" class="svg-firework-12"></path>
          <path d="M57.9062 48.4998C57.8497 48.613 57.7365 48.6696 57.6233 48.6696C57.5667 48.6696 57.5101 48.6696 57.5101 48.6696L53.2658 46.0664L57.7931 48.0471C57.9062 48.1602 58.0194 48.3866 57.9062 48.4998Z" fill="white" class="svg-firework-13"></path>
          <path d="M21.6321 17.3188C21.6886 17.3188 21.7452 17.2622 21.8018 17.2622C21.915 17.2622 22.0282 17.3188 22.0848 17.432L24.0654 22.0158L21.5189 17.7715C21.4623 17.7149 21.4623 17.6017 21.5189 17.5452C21.4623 17.432 21.5755 17.3754 21.6321 17.3188Z" fill="white" class="svg-firework-14"></path>
          <path d="M14.162 26.2032C14.1054 26.1466 14.1054 26.0334 14.162 25.9769C14.2186 25.8637 14.3317 25.7505 14.5015 25.7505C14.5581 25.7505 14.5581 25.7505 14.5581 25.7505L19.1985 27.5614L14.3883 26.4296C14.2751 26.3164 14.2186 26.2598 14.162 26.2032Z" fill="white" class="svg-firework-15"></path>
          <path d="M15.3505 37.1252C15.2939 37.1252 15.2373 37.1818 15.1807 37.1818C15.0675 37.1818 14.9543 37.1252 14.8977 37.0121C14.8412 36.8423 14.8977 36.6725 15.0109 36.5593L19.5947 34.6353L15.3505 37.1252Z" fill="white" class="svg-firework-16"></path>
          <path d="M24.7444 39.4453L23.3862 44.1989C23.3296 44.3121 23.2164 44.4253 23.0467 44.4253C22.9901 44.4253 22.9901 44.4253 22.9335 44.4253C22.7637 44.3687 22.6505 44.1989 22.7071 44.0291L24.7444 39.4453Z" fill="white" class="svg-firework-17"></path>
          <path d="M33.7424 44.2554C33.6858 44.2554 33.6292 44.2554 33.6292 44.2554C33.516 44.2554 33.4028 44.1988 33.3462 44.0857L31.7051 39.3887L33.9121 43.8027C33.9687 43.9725 33.9121 44.1422 33.7424 44.2554Z" fill="white" class="svg-firework-18"></path>
          <path d="M41.7781 36.1064C41.8347 36.1629 41.8347 36.2761 41.7781 36.3327C41.7215 36.4459 41.6083 36.5591 41.4952 36.5591C41.4386 36.5591 41.382 36.5591 41.382 36.5591L36.9114 34.3521L41.6084 35.9366C41.6649 35.9366 41.7215 35.9932 41.7781 36.1064Z" fill="white" class="svg-firework-19"></path>
          <path d="M41.3255 24.2793C41.4387 24.2793 41.5518 24.3359 41.6084 24.4491C41.665 24.5057 41.665 24.6188 41.6084 24.6754C41.5518 24.732 41.4952 24.8452 41.4952 24.8452L36.8548 26.6561L41.1557 24.2793C41.2123 24.3359 41.2689 24.2793 41.3255 24.2793Z" fill="white" class="svg-firework-20"></path>
          <path d="M54.228 39.7849C54.228 39.9546 54.1148 40.1244 53.8885 40.1244C53.7187 40.1244 53.5489 40.0112 53.5489 39.7849C53.5489 39.6151 53.6621 39.4453 53.8885 39.4453C54.0583 39.4453 54.228 39.6151 54.228 39.7849Z" fill="white" class="svg-firework-21"></path>
          <path d="M48.0029 22.921C47.437 22.921 46.9842 22.4683 46.9842 21.9024C46.9842 21.3365 47.437 20.8838 48.0029 20.8838C48.5688 20.8838 49.0215 21.3365 49.0215 21.9024C49.0215 22.4683 48.5688 22.921 48.0029 22.921Z" fill="white" class="svg-firework-22"></path>
          <path d="M39.5143 10.5843C39.4577 10.5843 39.4011 10.5277 39.4011 10.4711C39.4011 10.4145 39.4577 10.3579 39.5143 10.3579C39.5709 10.3579 39.6275 10.4145 39.6275 10.4711C39.684 10.5277 39.6275 10.5843 39.5143 10.5843Z" fill="white" class="svg-firework-23"></path>
          <path d="M19.9909 12.3385C19.708 12.3385 19.4816 12.1121 19.4816 11.8291C19.4816 11.5462 19.708 11.3198 19.9909 11.3198C20.2739 11.3198 20.5002 11.5462 20.5002 11.8291C20.5002 12.1121 20.2739 12.3385 19.9909 12.3385Z" fill="white" class="svg-firework-24"></path>
          <path d="M6.29584 24.732C6.18266 24.732 6.0695 24.6188 6.0695 24.5057C6.0695 24.3925 6.18266 24.2793 6.29584 24.2793C6.40902 24.2793 6.52222 24.3925 6.52222 24.5057C6.52222 24.6188 6.40902 24.732 6.29584 24.732Z" fill="white" class="svg-firework-25"></path>
          <path d="M9.86103 40.8602C9.86103 40.8037 9.91762 40.7471 9.97421 40.7471C10.0308 40.7471 10.0874 40.8037 10.0874 40.8602C10.0874 40.9168 10.0308 40.9734 9.97421 40.9734C9.91762 40.9734 9.86103 40.9168 9.86103 40.8602Z" fill="white" class="svg-firework-26"></path>
          <path d="M18.9723 52.0083C19.8212 52.0083 20.5002 52.6874 20.5002 53.5362C20.5002 54.3851 19.8212 55.0642 18.9723 55.0642C18.1234 55.0642 17.4444 54.3851 17.4444 53.5362C17.4444 52.6874 18.1234 52.0083 18.9723 52.0083Z" fill="white" class="svg-firework-27"></path>
          <path d="M35.1568 51.499C35.2134 51.499 35.27 51.5556 35.27 51.6122C35.27 51.6688 35.2134 51.7254 35.1568 51.7254C35.1002 51.7254 35.0436 51.6688 35.0436 51.6122C35.0436 51.5556 35.1002 51.499 35.1568 51.499Z" fill="white" class="svg-firework-28"></path>
          <path d="M4.25871 36.7856C4.54166 36.7856 4.71143 37.012 4.71143 37.2384C4.71143 37.5213 4.48507 37.6911 4.25871 37.6911C3.97576 37.6911 3.806 37.4647 3.806 37.2384C3.806 37.012 4.03235 36.7856 4.25871 36.7856Z" fill="white" class="svg-firework-29"></path>
        </svg>
      </div>
      
    </div>
  );
};




ReactDOM.render(
  <Game />,
  document.getElementById('app')
);