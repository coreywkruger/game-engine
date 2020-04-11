image=gameroom-frontend
mount=-v ${PWD}:/home/node/gameroom-frontend
network=--network gameroom
ports=-p 8000:8000
uid=$(shell id -u)

shell: image network
	docker run -it --rm --name ${image} --user ${uid} --entrypoint sh ${mount} ${ports} ${network} --network-alias frontend ${image}

image:
	docker build -t ${image} --target dev .

image_build:
	docker build -t ${image} --target builder .

network:
	docker network create gameroom | true

make stop:
	docker rm -f ${image}

start:
	npm start
