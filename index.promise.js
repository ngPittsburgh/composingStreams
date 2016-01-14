
var fs = require('fs'),
	path = require('path'),
	q =  require('q'),
	_ = require('lodash'),	
	cfg = require('./package.json').config;

//get groups-->
function getGroups(){
	var defer = q.defer();
	fs.readdir(cfg.startingPoint, function(err, dirContents){
		var groupDef = dirContents.filter(function(dirContentItemName){
			return dirContentItemName === path.basename(cfg.startingPoint) + '.json';
		});

		if (groupDef.length){
			groups = require(path.join(process.cwd(), cfg.startingPoint, groupDef[0]));
		}else{
			groups = dirContents.filter(function(dirContentItemName){
				return fs.statSync(path.join(cfg.startingPoint, dirContentItemName)).isDirectory()
			}).map(function(dirContentItemName){
				return { name: dirContentItemName };
			});
		}

		defer.resolve(groups);
	});
	return defer.promise;
}

function getFacetsForGroupMembers(groups){
	var faceted = groups.map(function(group) {
		var members = group.members.map(function(member){
			var defer = q.defer();
		    var memberPath = path.join(process.cwd(), cfg.startingPoint, group.name, member.id);
			fs.readdir(memberPath, function(err, facets){
				facets.forEach(function(facet){
					var o = {};
					var extensionLessName = path.basename(facet, '.json');
					o[extensionLessName] = require(path.join(memberPath, facet));
					_.assign(member, o);						
				});
				defer.resolve(member);
			});
			return defer.promise;
		});
		return q.all(members).then(function(members){
			group.members = members;
			return group;
		});
	});
	return q.all(faceted);
}


function getGroupMembersForGroups(groups){
	var groupMembers = groups.map(function(group){
		group.members = [];
		var defer = q.defer();
		var groupPath = path.join(process.cwd(), cfg.startingPoint, group.name);
		fs.readdir(groupPath, function(err, groupMembers){
			var groupMembersDef = groupMembers.filter(function(dirContentItemName){
				return dirContentItemName === path.basename(groupPath) + '.json';
			});

			if (groupMembersDef.length){
				group.members = require(path.join(groupPath, groupMembersDef[0]));
			}else{
				group.members = groupMembers.filter(function(dirContentItemName){
					return fs.statSync(path.join(groupPath, dirContentItemName)).isDirectory()
				}).map(function(dirContentItemName){
					return { id: dirContentItemName };
				});
			}
			defer.resolve(group);
		});
		
		return defer.promise;
	});
	return q.all(groupMembers);
}

getGroups()
	.then(getGroupMembersForGroups)
	.then(getFacetsForGroupMembers)
	.then(function(groups){
		console.log('groups: ', JSON.stringify(groups, undefined, 2));
	});

