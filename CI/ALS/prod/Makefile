
TAG    			:= $$(git describe --tags)
REGISTRY		:= registry.nersc.gov
PROJECT 		:= als
REGISTRY_NAME	:= ${REGISTRY}/${PROJECT}/${IMG}

NAME_CATAMEL  	:= catamel
IMG_CATAMEL  		:= ${NAME_CATAMEL}:${TAG}
REGISTRY_CATAMEL	:= ${REGISTRY}/${PROJECT}/${NAME_CATAMEL}:${TAG}



.PHONY: build

hello:
	@echo "Hello" ${REGISTRY}

build_catamel:
	@echo "tagging to: " ${IMG_CATAMEL}    ${REGISTRY_CATAMEL}
	@docker build -t ${IMG_CATAMEL} -f CI/ALS/Dockerfile .
	@echo "tagging to: " ${IMG_CATAMEL}    ${REGISTRY_CATAMEL}
	@docker tag ${IMG_CATAMEL} ${REGISTRY_CATAMEL}
 
push_catamel:
	@echo "Pushing " ${REGISTRY_CATAMEL}
	@docker push ${REGISTRY_CATAMEL}


login:
	@docker log -u ${DOCKER_USER} -p ${DOCKER_PASS}