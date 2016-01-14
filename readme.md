# composing streams

-	How? Create all observers with observables and pass subjects from stream to stream
	-	Then you can combine/merge streams, and stream all the things
-	Demo:
	-	reads groups from a directory 
		-	groups are either listed in [directoryName].json, or are subdirs of directory
			-	for each group-
				-	read members of group
				-	members are either listed in [groupName].json, or are subdirs of [groupName] directory
				-	for each member in each group-
					-	read facets of member and add to member
					-	facets are in [facetName].json files in [member] directory
					-	add member to group

# to install deps

-	`npm install`

# runnables

-	`npm run callbacks` runs callbacks script
-	`npm run promises` runs promises script
-	`npm run rx` runs rx script