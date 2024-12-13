# Gunakan base image Node.js
FROM node:16

# Set working directory di dalam container
WORKDIR /usr/src/app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Copy semua file aplikasi ke container
COPY . .

# Ekspos port untuk aplikasi
EXPOSE 8080

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
