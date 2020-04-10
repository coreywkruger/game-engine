image=gameroom
mount=-v ${PWD}:/home/node/gameroom
ports=-p 8000:8000
uid=$(shell id -u)

shell: image
	docker run -it --rm --name ${image} --user ${uid} --entrypoint sh ${mount} ${ports} ${image}

image:
	docker build -t ${image} --target dev .

image_build:
	docker build -t ${image} --target builder .

image_dist:
	docker build -t ${image} .

deploy_image:
	docker push ${image}

build:
	npm run build

make stop:
	docker rm -f ${image}

npm:
	npm

start:
	npm start
