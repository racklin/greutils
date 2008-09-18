CUR_DIR=${shell pwd}
DIST_DIR=${CUR_DIR}/dist
SRC_DIR=${CUR_DIR}/src
DOC_DIR=${CUR_DIR}/jsdoc

yuicompressor=${CUR_DIR}/jstools/yuicompressor-2.3.5/yuicompressor
packer=${CUR_DIR}/jstools/packer/packer
jsdoc=${CUR_DIR}/jstools/jsdoc-toolkit/jsdoc

NORMAL=core.js xpcom.js utils.js file.js dir.js cryptohash.js charset.js json.js sound.js pref.js \
 dialog.js thread.js controller.js
 
all: clean packer doc
 
combine:
	@echo "create GREUtils.js"
	cd ${SRC_DIR}; cat __init__.js ${NORMAL} > ${DIST_DIR}/GREUtils.js
	cd ${SRC_DIR}; cat __init__.js __jsm__.js ${NORMAL} > ${DIST_DIR}/GREUtils.jsm

yuicompressor: combine
	@echo "make compressed build"
	${yuicompressor} ${DIST_DIR}/GREUtils.js > ${DIST_DIR}/GREUtils.js.min
	cd ${SRC_DIR}; cat __init__.js ${DIST_DIR}/GREUtils.js.min > ${DIST_DIR}/GREUtils_min.js
	cd ${SRC_DIR}; cat __init__.js __jsm__.js ${DIST_DIR}/GREUtils.js.min > ${DIST_DIR}/GREUtils_min.jsm
	rm -f ${DIST_DIR}/GREUtils.js.min

packer: combine yuicompressor
	@echo "make packed build"
	${packer} ${DIST_DIR}/GREUtils_min.js  ${DIST_DIR}/GREUtils.js.packed
	cd ${SRC_DIR}; cat __init__.js ${DIST_DIR}/GREUtils.js.packed > ${DIST_DIR}/GREUtils_packed.js
	cd ${SRC_DIR}; cat __init__.js __jsm__.js ${DIST_DIR}/GREUtils.js.packed > ${DIST_DIR}/GREUtils_packed.jsm
	rm -f ${DIST_DIR}/GREUtils.js.packed

clean:
	@echo "clean dist directory"
	rm -fr ${DIST_DIR}/*
	rm -fr ${CUR_DIR}/jsdoc/*

doc:
	@echo "create GREUtils docs"
	${jsdoc} ${DIST_DIR}/GREUtils.js

