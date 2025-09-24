#!/bin/bash

# Function to list processes with open TCP listening ports
list_ports() {
    sudo lsof -nP -iTCP -sTCP:LISTEN |
    awk 'NR==1{print "COMMAND PID USER PORT EXECUTABLE"; next} {
        pid=$2
        exe_path="/proc/" pid "/exe"
        exe_real=$(readlink -f "/proc/"pid"/exe" 2>/dev/null || echo "[kernel/listening]")
        split($9, addr, ":")
        port=addr[2]
        printf "%-10s %-6s %-10s %-6s %s\n", $1, pid, $3, port, exe_real
    }'
}

clear
echo "Press any key to stop..."
# Set terminal to read single keypress without Enter
stty -echo -icanon time 5 min 0

while true; do
    clear
    list_ports
    sleep 0.5
    read -t 0.01 -n 1 key && break
done

# Restore terminal settings
stty sane
echo "Stopped."
