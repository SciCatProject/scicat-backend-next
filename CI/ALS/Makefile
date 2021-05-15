REGISTRY		:= registry.nersc.gov
PROJECT 		:= als
REGISTRY_NAME	:= ${REGISTRY}/${PROJECT}/${IMG}

NAME_CATAMEL  	:= catamel
CATAMEL_TAG    	:= $$(git -C ../../ describe --tags)
IMG_CATAMEL  		:= ${NAME_CATAMEL}:${CATAMEL_TAG}
REGISTRY_CATAMEL	:= ${REGISTRY}/${PROJECT}/${NAME_CATAMEL}:${CATAMEL_TAG}

# make -C CI/ALS <target>

.PHONY: build_catamel push_catamel 


build_catamel:
	@echo "tagging to: " ${IMG_CATAMEL}    ${REGISTRY_CATAMEL}
	@docker build -t ${IMG_CATAMEL} -f Dockerfile ../../
	@echo "tagging to: " ${IMG_CATAMEL}    ${REGISTRY_CATAMEL}
	@docker tag ${IMG_CATAMEL} ${REGISTRY_CATAMEL}
 
push_catamel:
	@echo "Pushing " ${REGISTRY_CATAMEL}
	@docker push ${REGISTRY_CATAMEL}


login:
	@docker log -u ${DOCKER_USER} -p ${DOCKER_PASS}