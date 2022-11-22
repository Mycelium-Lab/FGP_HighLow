// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title FairHighlow 
/// @notice Game like roulette in casino with ERC20 tokens
contract FairHighlow is Ownable {

    /// @notice Current gameId
    /// @dev Needs for creating mapping of games
    uint256 gameId;
    /// @notice Current nonce
    /// @dev Needs for creating pseudorandom numbers
    uint256 nonce;
    /// @notice Last finished game id
    /// @dev For creating actual games list
    uint256 lastFinishedGameId;
    /// @notice Current commission percent
    /// @dev If equal 100, percent = 1%
    /// @return uint16
    uint16 public feePercent;
    /// @notice Time to finish the game
    /// @dev If equal 150, time = 100 seconds
    /// @return uint16
    uint16 public timeToFinish;
    /// @notice Max users games amount return
    /// @dev If equals 30 we can return only 30 games
    /// @return uint16
    uint16 public userGamesToReturnNumber;
    /// @notice Address to get commission
    /// @return address
    address public wallet;
    /// @notice User games
    uint256[] gamesByUser;

    /// @notice Create create game event
    /// @param gameId game id
    /// @param bid amount to play
    /// @param token ERC-20 token address
    event CreateGame(uint256 gameId, uint256 bid, address token);
    /// @notice Create finish game event
    /// @param gameId game id
    /// @param winners winners addresses
    /// @param prizes prizes corresponding to the winners
    /// @param token ERC-20 token address
    event FinishGame(uint256 gameId, address[] winners, uint256[] prizes, address token);

    struct Game {
        address owner;
        bool isFinished;
        uint256 bid;
        address[] participants;
        uint8[] numbers;
        uint256 participantsLimit;
        uint256 createdTimestamp;
        uint256 pool;
        uint256 individualPrize;
        uint8 luckyNumber;
        uint256[] prizes;
        address[] winners;
        uint8[] bets;
        address token;
    }

    struct Bid {
        bool participatedFlag;
        uint8 number;
    }

    struct GamesIdList {
        uint256[] gamesByUser;
    }

    struct Prize {
        bool isWinner;
        bool isClaimed;
        uint256 prize;
    }

    /// @notice List of all games in mapping format
    mapping (uint256 => Game) public gamesList; // gameId => Game struct
    /// @notice List of all game bids in mapping format
    mapping (uint256 => mapping(address => Bid)) public biddersList;  // gameId => participant_address => Bid
    /// @notice List of all user games in mapping format
    mapping (address => GamesIdList) gamesByUserList; // user address => array of all his games
    /// @notice List of all prizes of game in mapping format
    mapping (address => mapping(uint256 => Prize)) public prizeList;    // user address => gameId => winner or not

    constructor(address _wallet, uint16 _feePercent, uint16 _timeToFinish, uint16 _userGamesToReturnNumber) {
        require(_wallet != address(0), 'Wallet is address(0)');
        require(_feePercent < 10000, 'Fee percent is more than 10000');
        require(_timeToFinish != 0, 'Time to finish is equal to 0');
        require(_userGamesToReturnNumber >= 30, 'UserGamesToReturnNumber have to be more than 30');
        wallet = _wallet;
        feePercent = _feePercent; //if equals 100 -> percent = 1%
        timeToFinish = _timeToFinish; //seconds
        userGamesToReturnNumber = _userGamesToReturnNumber;
    }

    /// @notice Creates new game
    /// @dev Add data to all variables
    /// @param _number a random guessed number that the player has chosen
    /// @param _limit limit of players - max 255
    /// @param amount bid
    /// @param token token address
    function createGame(uint8 _number, uint8 _limit, uint256 amount, address token) public onlyInRange(_number) {  
        require(amount > 0, "FairHighlow: amount can't be 0");
        IERC20 _token = IERC20(token);
        _token.transferFrom(msg.sender, address(this), amount);
        gamesList[gameId].owner = msg.sender;
        gamesList[gameId].pool += amount;
        gamesList[gameId].bid = amount;
        gamesList[gameId].participants.push(msg.sender);
        gamesList[gameId].participantsLimit = _limit;
        gamesList[gameId].numbers.push(_number);
        gamesList[gameId].createdTimestamp = block.timestamp;
        gamesList[gameId].luckyNumber = 0;
        gamesList[gameId].token = token;
        biddersList[gameId][msg.sender].number = _number;
        biddersList[gameId][msg.sender].participatedFlag = true;
        gamesByUserList[msg.sender].gamesByUser.push(gameId);
        emit CreateGame(gameId, amount, token);
        gameId ++;
    }

    /// @notice Join to the game
    /// @dev Modifiers checks if the numbers are between 0 and 255, the game is still up to date and the number has not yet been guessed.
    /// @param _gameId game id to join
    /// @param _number a random guessed number that the player has chosen
    function joinGame(uint256 _gameId, uint8 _number) public onlyInRange(_number) onlyInGamePeriod(_gameId) onlyNotExistedNumber(_gameId, _number) {
        IERC20 _token = IERC20(gamesList[_gameId].token);
        _token.transferFrom(msg.sender, address(this), gamesList[_gameId].bid);
        require(msg.sender != gamesList[_gameId].owner, "FairHighlow: Owner is already in participants list"); 
        require(biddersList[_gameId][msg.sender].participatedFlag == false, "FairHighlow: You can not join twice");
        require(
            gamesList[_gameId].participantsLimit == 0 || gamesList[_gameId].participants.length < gamesList[_gameId].participantsLimit, 
            "FairHighlow: Participants limit has been reached"
        );
        gamesList[_gameId].pool += gamesList[_gameId].bid;
        gamesList[_gameId].participants.push(msg.sender);
        gamesList[_gameId].numbers.push(_number);
        biddersList[_gameId][msg.sender].number = _number;
        biddersList[_gameId][msg.sender].participatedFlag = true;
        gamesByUserList[msg.sender].gamesByUser.push(_gameId);
    }

    /// @notice Finish the game
    /// @dev Generate pseudorandom numbers and and depending on the number of participants choose winners
    /// @param _gameId game id to finish
    function finishGame(uint256 _gameId) public { 
        require(gamesList[_gameId].isFinished == false, "FairHighlow: The game is finished already");
        require(block.timestamp > gamesList[_gameId].createdTimestamp + timeToFinish, "FairHighlow: You can finish a game only after exact period");
        require(biddersList[_gameId][msg.sender].participatedFlag == true, "FairHighlow: Only participants can finish a game");
        if(gamesList[_gameId].participants.length == 1) {
            prizeList[msg.sender][_gameId].isWinner = true;
            prizeList[msg.sender][_gameId].prize = gamesList[_gameId].pool;
            gamesList[_gameId].winners.push(msg.sender);
            gamesList[_gameId].prizes.push(gamesList[_gameId].pool);
        } else {
            uint8 randomNumber = generateRandom();
            gamesList[_gameId].luckyNumber = randomNumber;
            address[] memory winners = new address[](gamesList[_gameId].participants.length); // array of participants for ascending sort
            uint8[] memory numbers = new uint8[](gamesList[_gameId].numbers.length);  // array of participants numbers for ascending sort
            winners = gamesList[_gameId].participants;
            numbers = gamesList[_gameId].numbers;
            uint8[] memory differences = new uint8[](numbers.length);
            for (uint256 i = 0; i < winners.length; i++) {
                if (numbers[i] > randomNumber) {
                    differences[i] = numbers[i] - randomNumber;
                } else if (numbers[i] < randomNumber) {
                    differences[i] = randomNumber - numbers[i];
                } else {
                    differences[i] = 0;
                }
            }
            uint256 numberOfWinners = differences.length / 3;
            if (numberOfWinners == 0) {
                numberOfWinners = 1;
            }
            uint8[] memory positionsOfWinners = new uint8[](numberOfWinners);
            address[] memory actualWinners = new address[](numberOfWinners);
            
            for (uint256 i = 0; i < numberOfWinners; i++) {
                uint8 minDifference = 100;
                uint8 winner;
                for (uint8 j = 0; j < numbers.length; j++) {
                    if (differences[j] < minDifference) {
                        winner = j;
                        minDifference = differences[j];
                    }
                }
                differences[winner] = 100;
                positionsOfWinners[i] = winner;
                actualWinners[i] = winners[winner];
            }
            if (numberOfWinners > 1) {
                uint256 pool = gamesList[_gameId].pool;
                uint8 temp = 3;
                for (uint256 i = 2; i < actualWinners.length; i++) {
                    temp = temp * 2 + 1;
                }
                uint256 prizePiece = pool/temp;
                for (uint256 i = actualWinners.length - 1; i > 0; i--) {
                    prizeList[actualWinners[i]][_gameId].prize = prizePiece;
                    prizeList[actualWinners[i]][_gameId].isWinner = true;
                    gamesList[_gameId].prizes.push(prizePiece);
                    gamesList[_gameId].winners.push(actualWinners[i]);
                    prizePiece = prizePiece * 2;
                }
                prizeList[actualWinners[0]][_gameId].prize = prizePiece;
                prizeList[actualWinners[0]][_gameId].isWinner = true;
                gamesList[_gameId].prizes.push(prizePiece);
                gamesList[_gameId].winners.push(actualWinners[0]);
            }
            else {
                prizeList[actualWinners[0]][_gameId].isWinner = true;
                prizeList[actualWinners[0]][_gameId].prize = gamesList[_gameId].pool;
                gamesList[_gameId].prizes.push(gamesList[_gameId].pool);
                gamesList[_gameId].winners.push(actualWinners[0]);
            }
        }
        gamesList[_gameId].isFinished = true;
        lastFinishedGameId = _gameId;
        emit FinishGame(_gameId, gamesList[_gameId].winners, gamesList[_gameId].prizes, gamesList[_gameId].token);
    }

    /// @notice Claim prize
    /// @dev Checks if sender is winner, commission is taken
    /// @param _gameId id of the game in which to claim the prize
    function claim(uint256 _gameId) public {
        require(prizeList[msg.sender][_gameId].isWinner == true, "FairHighlow: You are not a winner of the game");
        require(prizeList[msg.sender][_gameId].isClaimed == false, "FairHighlow: Prize is claimed already");
        prizeList[msg.sender][_gameId].isClaimed = true;
        uint256 prize = prizeList[msg.sender][_gameId].prize;
        uint256 sendToUser =  prize - prize * feePercent / 10000;
        uint256 sendToWallet = prize - sendToUser;
        IERC20 _token = IERC20(gamesList[_gameId].token);
        _token.transfer(msg.sender, sendToUser);
        _token.transfer(wallet, sendToWallet);
    }

    // Utils functions
    /// @notice Returns actual games data
    /// @dev Checks last finished game id and based on this, games are taken
    /// @return uint256[] data
    function getActualGames() public view returns(uint256[] memory) {
        uint256[] memory actualGames = new uint256[]((gameId - lastFinishedGameId) * 5); 
        uint256 counter;
        for (uint256 _gameId = lastFinishedGameId; _gameId < gameId; _gameId ++) {
            if (gamesList[_gameId].isFinished == false) {
                actualGames[counter] = gamesList[_gameId].bid;
                actualGames[counter + 1] = gamesList[_gameId].createdTimestamp;
                actualGames[counter + 2] = gamesList[_gameId].participants.length;
                actualGames[counter + 3] = _gameId;
                actualGames[counter + 4] = gamesList[_gameId].participantsLimit;
                counter += 5;
            }
        }
        return actualGames;
    }

    /// @notice Returns game's owner
    /// @param _gameId game id
    /// @return address owner
    function getOwner(uint256 _gameId) public view returns(address) {
        return gamesList[_gameId].owner;
    }

    /// @notice Returns user's bet number
    /// @param _gameId game id
    /// @return uint8 bet
    function getBet(uint256 _gameId, address adr) public view returns(uint8) {
        return biddersList[_gameId][adr].number;
    }

    /// @notice Returns game's guessed numbers
    /// @param _gameId game id
    /// @return uint8[] numbers
    function getNumbers(uint256 _gameId) public view returns(uint8[] memory) {
        return gamesList[_gameId].numbers;
    }

    /// @notice Returns game's token
    /// @param _gameId game id
    /// @return address token address
    function getToken(uint256 _gameId) public view returns(address) {
        return gamesList[_gameId].token;
    }

    /// @notice Return all game's prizes
    /// @param _gameId game id
    /// @return uint256[] rewards
    /// @return address[] players
    /// @return uint256[] bets
    function getPrizes(uint256 _gameId) public view returns(uint256[] memory, address[] memory, uint256[] memory) {
        uint256[] memory bets = new uint256[](gamesList[_gameId].participants.length);
        uint256[] memory rewards = new uint256[](gamesList[_gameId].participants.length);
        address[] memory players = new address[](gamesList[_gameId].participants.length);
        for (uint256 i = 0; i < gamesList[_gameId].participants.length; i++) {
            bets[i] = gamesList[_gameId].numbers[i];
            players[i] = gamesList[_gameId].participants[i];
            bool isWinner = false;
            uint256 iterator = 0;
            for (uint256 j = 0; j < gamesList[_gameId].winners.length; j++) {
                if (gamesList[_gameId].winners[j] == players[i]) {
                    isWinner = true;
                    iterator = j;
                }
            }
            if (isWinner) {
                rewards[i] = gamesList[_gameId].prizes[iterator];
            }
            else {
                rewards[i] = 0;
            }
        }
        return (rewards, players, bets);
    }

    /// @notice Return all user games
    /// @dev If games more than current userGamesToReturnNumber return only userGamesToReturnNumber amount
    /// @param _user user
    /// @return uint256[] user games data
    function getUserGames(address _user) public view returns(uint256[] memory) {
        uint256 counter;
        (
            uint256 _gameId, 
            uint256[] memory userGames
        ) 
        = 
            gamesByUserList[_user].gamesByUser.length < 30 
            ? 
            (
                0, 
                new uint256[](gamesByUserList[_user].gamesByUser.length * 8))
            :
            (
                gamesByUserList[_user].gamesByUser.length - userGamesToReturnNumber,
                new uint256[](userGamesToReturnNumber * 8)
            );
        for (
            _gameId;
            _gameId < gamesByUserList[_user].gamesByUser.length; 
            _gameId ++
        ) {
            uint256 currentGameId = gamesByUserList[_user].gamesByUser[_gameId];
            userGames[counter] = gamesList[currentGameId].bid;
            userGames[counter + 1] = gamesList[currentGameId].createdTimestamp;
            userGames[counter + 2] = gamesList[currentGameId].participants.length;
            userGames[counter + 4] = currentGameId;
            userGames[counter + 5] = gamesList[currentGameId].pool;
            userGames[counter + 6] = gamesList[currentGameId].luckyNumber;
            userGames[counter + 7] = prizeList[_user][currentGameId].prize;
            if (prizeList[_user][currentGameId].isClaimed) {
                userGames[counter + 3] = 0; // prize is claimed 
            } else if (prizeList[_user][currentGameId].isWinner) {
                userGames[counter + 3] = 1; // the game is finished already and user allowed to claim prize
            } else if (!gamesList[currentGameId].isFinished && block.timestamp >= gamesList[currentGameId].createdTimestamp + timeToFinish) {
                userGames[counter + 3] = 2; // the game is ready for finish
            } else {
                userGames[counter + 3] = 3; // the game in progress
            }
            counter += 8;
        }
        return userGames;
    }
    
    /// @notice Generate pseudorandom number
    /// @return uint8 pseudorandom number
    function generateRandom() public returns(uint8) {
        uint8 randomNumber = uint8(uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % 256); 
        nonce++;
        return randomNumber;
    }

    /// @notice Change commission percent
    /// @param _feePercent new commission percent
    function newFeePercent(uint16 _feePercent) external onlyOwner {
        require(_feePercent < 10000, 'FairHighlow: New fee percent is less than 10000');
        feePercent = _feePercent;
    }

    /// @notice Change wallet to receive commision
    /// @param _wallet new wallet
    function newWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), 'FairHighlow: New Wallet is address(0)');
        wallet = _wallet;
    }

    /// @notice Change time to finish
    /// @param _timeToFinish new time to finish
    function newTimeToFinish(uint16 _timeToFinish) external onlyOwner {
        require(_timeToFinish != 0, 'FairHighlow: Time to finish is equal to 0');
        timeToFinish = _timeToFinish;
    }

    /// @notice Change user games to return amount
    /// @param _userGamesToReturnNumber new user games to return amount
    function newUserGamesToReturnNumber(uint16 _userGamesToReturnNumber) external onlyOwner {
        require(_userGamesToReturnNumber >= 30, 'FairHighlow: UserGamesToReturnNumber have to be more than 30');
        userGamesToReturnNumber = _userGamesToReturnNumber;
    }
    // Modifiers

    /// @notice Checks if number in range
    modifier onlyInRange(uint8 _number) {
        require(_number >= 0 && _number <= 255, "FairHighlow: Choose number between 0 and 100");
        _;
    }

    /// @notice Checks if game is actual
    modifier onlyInGamePeriod(uint256 _gameId) {
        require(block.timestamp <= gamesList[_gameId].createdTimestamp + timeToFinish, "FairHighlow: The game is finished"); 
        _;
    }

    /// @notice Checks if number not exist in bets
    modifier onlyNotExistedNumber(uint256 _gameId, uint8 _number) {
        uint8[] memory numbers = gamesList[_gameId].numbers;
        for(uint8 i; i < numbers.length; i++) {
            require(numbers[i] != _number, 'FairHighlow: Already existed number');
        }
        _;
    }
}

