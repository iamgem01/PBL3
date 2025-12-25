IP_LOCAL=$(ip route get 1.1.1.1 | awk '{print $7}' | head -1)
IP_LOCAL=$(hostname -I | awk 'print $1}')
echo "HOST_IP = $IP_LOCAL"