# MOBI

MOBI is a monitor of computational resources focused on environments of Big Data processing.

This Docker Image installs an MongoDB with default database called test where the computing 
resources are kept. There are two main collections on test database:

- pcs: Where maintain a list with all nodes information like name, ip, metrics collected, 
processor info, memory info
- nodename: Each node has its own collection where its data, like memory use, cpu use, is saved
each second or granularity specified on collector.

In this repository that are a version of dstat, but with some aditional features needed to work
with MOBI. A MongoDB connection to sendo the information about the computational node to
the database.

## Prerequisites

* Python 2.2 or higher
* Docker 1.13.0+
* Docker Compose 3 or higher
* Don't forget to allow the execution of dstat:

```mobi/collector$ chmod +x dstat```

## Installing

It is very easy to install the server, simple use:

```mobi$ docker-compose up --build```

Now, execute dstat, the most simple use of dstat is:

```mobi/collector$ ./dstat --mongo localhost:27017,test```

This command line create a connection with mongo server and database,
in order to access the same database from another node you can use:

```collector$ ./dstat --mongo ip:port,database```

Where the ip is the ip of machine that is running MOBI, port is the
MongoDB port access (27017 is the default MongoDB port) and default database 
is test.

Obs.: Note, that using dstat in that way will only collect:

- CPU Total Use
- CPU System Total Use
- CPU Idle
- CPU Wait
- CPU Total Steal
- Disk Total Read
- Disk Total Write
- Network Total Received
- Network Total Send
- Memory Pages In
- Memory Pages Out
- System Interruptions
- System Context Switches

but if you need more, less or specific metrics, you can
read the dstat documentation with:

```mobi/collector$ dstat --help```

#### Observations

You may need install some python packages.
