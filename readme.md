# Snake multiplayer using Node.js and WebSocket
Let multiple players battle their snakes on a web-page.

### Install [Node.js version 7.x](https://nodejs.org/en/download/package-manager/)
```
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
```
### Use git to clone this project
```
git clone https://github.com/gwelt/snake_websocket
cd snake_websocket
```
### Install Node.js-dependencies and start the server
```
npm install
npm start
```
### Connect
Open [http://localhost:3000](http://localhost:3000) and/or connect to your local ip on port 3000 from other devices.

### Spread the snakes!
- Run [./port3000redirect.sh](https://github.com/gwelt/snake_websocket/blob/master/port3000redirect.sh) on your server to add redirect-rules to your [IPTABLES](https://help.ubuntu.com/community/IptablesHowTo) and enable connections to [http://localhost](http://localhost) (port 80). 
- If you run Apache, you can enable these mods...
```
sudo a2enmod proxy proxy_wstunnel
```
...and add these ProxyPass-directives to your apache.conf, to publish snakes on port 80:
```
<VirtualHost *:80>
    ProxyPass /socket ws://localhost:3000/
    ProxyPass / http://localhost:3000/
</VirtualHost>
```
- Use [PM2](http://pm2.keymetrics.io/) process manager.

