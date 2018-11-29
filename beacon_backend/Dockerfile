# Dockerfile mostly based on egacrg/beacon
FROM debian:latest
MAINTAINER Lorenz Gerber <gerberlo@gis.a-star.ed.sg>
RUN apt-get clean -y; \
    apt-get update -y -qq; \
    apt-get install -y --no-install-recommends -q wget netcat postgresql-client default-jre-headless default-jdk-headless

RUN apt-get -y install maven git  || \
    apt-get -y update && apt-get -y install maven git
WORKDIR /tmp
RUN git clone https://github.com/lorenzgerber/beacon-elixir.git human-data-beacon 
RUN sed -i 's#allowed\.origins=.*$#allowed.origins=*#' /tmp/human-data-beacon/elixir_beacon/src/main/resources/META-INF/corsFilter.properties
RUN sed -i 's#^\s*datasource.elixirbeacon.url=.*$#datasource.elixirbeacon.url=jdbc\\:postgresql\\://beacon_db\\:5432/elixir_beacon_dev#g' \
    /tmp/human-data-beacon/elixir_beacon/src/main/resources/application-dev.properties
RUN grep datasource.elixirbeacon.url /tmp/human-data-beacon/elixir_beacon/src/main/resources/application-dev.properties

WORKDIR /tmp/human-data-beacon/elixir_core
RUN mvn clean compile jar:jar  
RUN mvn install -DskipTests

WORKDIR /tmp/human-data-beacon/elixir_beacon
RUN mvn clean compile package -Dspring.profiles.active="dev" -Dmaven.test.skip=true 

RUN cp /tmp/human-data-beacon/elixir_beacon/target/elixir-beacon-0.3.jar /tmp/elixirbeacon-service.jar
RUN rm -rf /tmp/human-data-beacon/
RUN apt-get -y remove git maven wget && apt-get -y autoremove

COPY beacon.sh /tmp
EXPOSE 9075
CMD /bin/sh /tmp/beacon.sh
