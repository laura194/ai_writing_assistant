# ---- Backend Build ----
    FROM node:22

    # Arbeitsverzeichnis setzen
    WORKDIR /app
    
    # Nur package.json & lockfile zuerst kopieren (für Caching von npm ci)
    COPY package*.json ./
    
    # Dependencies installieren
    RUN npm ci
    
    # Restlichen Code kopieren
    COPY . .
    
    # Ports öffnen (Express läuft typischerweise auf 3000)
    EXPOSE 3000
    
    # Standard-Command
    CMD ["npm", "start"]
    