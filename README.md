# beacon-gis
## What is Beacon ?
Beacon is a REST API for feature discovery in genomic datasets. The API is defined in the OpenAPI format and can be found either on [GitHub](https://github.com/ga4gh-beacon/specification/blob/master/beacon.yaml) or on [Swaggerhub](https://app.swaggerhub.com/apis/ELIXIR-Finland/ga-4_gh_beacon_api_specification/1.0.0-rc1).

## Implementations
There are a number of implementations of the above mentioned API specification. Notably one in [Java](https://github.com/ga4gh-beacon/beacon-elixir) using the Spring framework and one in [Python](https://github.com/CSCfi/beacon-python). In the Beacon developer related [Slack](beacon-team.slack.com) forum, the original python version is coloquially called the "Finnish Beacon". Of the Finnish Beacon exists a [fork](https://github.com/NBISweden/beacon-python) with certain modifications in the database structure which is called the "Swedish Beacon".

## The GIS Beacon - Overview
At GIS, the first iteration of Beacon used an early version of the Java Beacon. The general architeture consist of an Java Spring Boot application as REST API / backend. It connects by default to a Postgres database. As frontend, a very simple React frontend, merely a HTML form, was implemented. At GIS, we use a dockerized version of the application. 

Below is a list of the related repositories:

* [beacon-gis](https://github.com/lorenzgerber/beacon-gis)
    * This repo contains the docker-compose script to start the backend. In the current version, it needs to be started manually by ssh-ing into the respective instance.
* [beacon-elixir](https://github.com/ga4gh-beacon/beacon-elixir)
    * The actual backend code, (Java 8, Spring Boot). It is advisable to fork the original. This allows to version the modifications such as specific configuration for GIS etc.  
* [beacon-db](https://github.com/lorenzgerber/beacon-db)
    * This repo contains mostly the Dockerfile based on a official postgres image. Additionally, an init and data loading script.
* [beacon-ui-react](https://github.com/lorenzgerber/beacon-ui-react)
    * This repo contains the source for the frontend. The Dockerfile describes a two-stage build: Stage 0 builds the actual node.js application and which is copied into stage 1 which is based on an official nginx image.

To automate deployment of the setup, AWS EC2 launch scripts using cloudinit are available in a repository for both the [backend](https://github.com/lorenzgerber/aws_launchers/tree/master/beacon-gis) and the [frontend](https://github.com/lorenzgerber/aws_launchers/tree/master/beacon-ui-nginx). The backend launch scripts make use of a (non-public) [S3 bucket](https://s3-ap-southeast-1.amazonaws.com/data.beacon) where the data is stored. The data consists of a `tar.gz` archive that contains parsed `vcf` files. Parsing of `vcf` files is a preparation step to be done prior to deployment. A [parse script](https://raw.githubusercontent.com/ga4gh-beacon/beacon-elixir/master/elixir_beacon/src/main/resources/META-INF/vcf_parser.sh) is provided in the beacon-elixir project. The parsed data (three `csv` files) are loaded into the database on startup.

The deployment of the backend is done into the RPD AWS account while the frontend in the Ronin AWS account. The reason for the Ronin account is that Ronin owns the .genome.sg domain. The routing is done through Route53 on AWS. The routing needs to be on a ignore list in the Ronin internal system, else, the routing gets removed automatically after a short time.

## Step by Step - Deployment
1. Parse Data  
The [parse script](https://raw.githubusercontent.com/ga4gh-beacon/beacon-elixir/master/elixir_beacon/src/main/resources/META-INF/vcf_parser.sh) expects a default vcf file. Ideally, the vcf file contains in the `INFO` section the tags `AC`, `AN` and `AC`. These `.vcf` fields translate to the following Beacon fields:
    * `AN`: total number of alleles in called genotypes -> `callCount`
    * `AC`: allele count in genotypes, for each ALT allele in same order as listed -> `variantCount`
    * `AF`: allele frequency for each ALT allele in the same order as listed -> `frequency` 
2. Compress parsed data into tar.gz
3. Uploade parsed data to S3
4. Launch backend instance
5. ssh into backend and docker-compose up the system
6. Lauch frontend instance
7. Adjust public IP address in Route53 

