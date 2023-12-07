FROM node:lts
# Set working directory
WORKDIR /app

# install node modules
COPY ./package*.json .
RUN npm install
RUN npm install pm2 -g

# Copy all files from current directory to working dir in image
COPY . ./

ENV PORT 80
ENV PM2_NAME pokeforge-frontend

ENTRYPOINT [ "npm", "run", "start_dev"]
