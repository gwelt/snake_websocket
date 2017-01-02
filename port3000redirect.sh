#!/bin/bash
#sudo service apache2 stop
sudo iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 80 -j REDIRECT --to-ports 3000
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
sudo iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 83 -j REDIRECT --to-ports 3000
sudo iptables -t nat -I PREROUTING -p tcp --dport 83 -j REDIRECT --to-ports 3000
sudo iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 443 -j REDIRECT --to-ports 3000
sudo iptables -t nat -I PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 3000
sudo iptables -t nat -L --line-numbers
echo -e "\nNOW REDIRECTING INCOMING/DESTINATION \e[42mPORT 80\e[49m TO \e[42mPORT 3000\e[49m"
