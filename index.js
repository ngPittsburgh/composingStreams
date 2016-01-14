
var fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	cfg = require('./package.json').config,
	finalGroups = [];



//read groups-->
fs.readdir(cfg.startingPoint, function(err, dirContents){
	var groups = [];
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

	//read each group-->
	groups.forEach(function(group){		
		group.members = [];
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

			//read each group member's facets-->
			group.members.forEach(function(member,i){
				var memberPath = path.join(process.cwd(), cfg.startingPoint, group.name, member.id);
				fs.readdir(memberPath, function(err, facets){

					//add each facet to the member-->
					facets.forEach(function(facet){
						var o = {};
						var extensionLessName = path.basename(facet, '.json');
						o[extensionLessName] = require(path.join(memberPath, facet));
						
						_.assign(member, o);		
						console.log('member: ', JSON.stringify(member, undefined, 2));
					});
					
				});
			});
			
			
		});
	});
});
