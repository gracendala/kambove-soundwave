FROM savonet/liquidsoap:main

# Installation de ffmpeg pour le support de différents formats audio
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Création du répertoire de logs
RUN mkdir -p /var/log/liquidsoap && \
    chmod 777 /var/log/liquidsoap

# Script Liquidsoap
COPY radio.liq /etc/liquidsoap/radio.liq

# Commande de démarrage
CMD ["liquidsoap", "/etc/liquidsoap/radio.liq"]
