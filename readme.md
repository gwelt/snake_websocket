# Snake with Node.js and websocket
Let multiple players battle with their snakes on a web-page.

### Install [Node.js version 7.x](https://nodejs.org/en/download/package-manager/)
```
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
```
### Use git to clone this project
```
git clone https://github.com/gwelt/snake_websocket
cd snake_websocket
```
### install node.js-dependencies and start the server
```
npm install
npm start
```
### Connect
Open [http://localhost:3000](http://localhost:3000) and/or connect to your local ip on port 3000 from other devices.

### Redirect port 3000 to port 80
Start ./port3000redirect.sh to add redirect-rules to your [IPTABLES](https://help.ubuntu.com/community/IptablesHowTo). Your server will now be listening on port 80.
Open [http://localhost](http://localhost).
