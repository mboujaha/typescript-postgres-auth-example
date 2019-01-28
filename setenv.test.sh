#!/bin/sh

## DO NOT USE THESE DEFAULT VALUES
## BEST PRACTICE IS USE SECRETS TO SET ENV PARAMS WITH YOUR CI 
## PROVIDER AND CONTAINER ORCHESTRATION (I.E. KUBERNETES) SYSTEMS

echo "Creating test .env file ..."
tee -a .env << END
PORT=3000
JWT_SECRET=d3vs3cr3t
OPEN_CAGE_DATA_KEY={Add Your Key Here}
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=auth_example
REDIS_URL=localhost
END

echo "Creating test docker.env file ..."
tee -a docker.env << END
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=auth_example
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
END

echo "Done creating test configs"