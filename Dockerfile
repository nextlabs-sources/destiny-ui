FROM httpd:2.4-alpine

LABEL name="NextLabs Control Center - Console UI"

ENV APACHE_HTTPD_HOME=/usr/local/apache2
ENV NEXTLABS_CC_USER_GROUP=nextlabs
ENV NEXTLABS_CC_USER_NAME=nextlabs

RUN addgroup -S $NEXTLABS_CC_USER_GROUP \
    && adduser -S $NEXTLABS_CC_USER_NAME -G $NEXTLABS_CC_USER_GROUP \
    && chown -R $NEXTLABS_CC_USER_NAME:$NEXTLABS_CC_USER_GROUP $APACHE_HTTPD_HOME \
    && apk add --no-cache libcap \
    && setcap CAP_NET_BIND_SERVICE=+eip $APACHE_HTTPD_HOME/bin/httpd

COPY --chown=${NEXTLABS_CC_USER_NAME}:${NEXTLABS_CC_USER_GROUP} ./ui $APACHE_HTTPD_HOME/htdocs/ui/
COPY --chown=${NEXTLABS_CC_USER_NAME}:${NEXTLABS_CC_USER_GROUP} ./index.html ./favicon.ico $APACHE_HTTPD_HOME/htdocs/

USER ${NEXTLABS_CC_USER_NAME}
