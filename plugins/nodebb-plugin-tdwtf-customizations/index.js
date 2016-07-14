/* jshint node: true */

var async = module.parent.require('async');
var Groups = module.parent.require('./groups');
var Posts = module.parent.require('./posts');
var Categories = module.parent.require('./categories');
var events = module.parent.require('./events');

module.exports = {
	"meta": function(tags, callback) {
		tags = tags.concat([{
			name: 'google-site-verification',
			content: 'CHVbCxly52Dog4tN9fsbqoQkNTASojg2LzYSeJzqRgw'
		}]);

		callback(null, tags);
	},
	"header": function(data, callback) {
		async.parallel({
			groups: async.apply(Groups.isMemberOfGroups, data.templateValues.user.uid, ['Mafia - Players', 'Mafia - Club Ded']),
			clubDed: async.apply(Categories.getTopicIds, 'cid:32:tids', false, 0, 0)
		}, function(err, results) {
			if (err) {
				return callback(err, data);
			}

			data.templateValues.user.isMafiaPlayer = results.groups[0];
			data.templateValues.user.isMafiaClubDed = results.groups[1] && results.clubDed[0];
			data.templateValues.userJSON = JSON.stringify(data.templateValues.user);
			callback(null, data);
		});
	},
	"postEdit": function(data, callback) {
		if (data.uid === 140870 || data.uid === 140914 || data.uid === 140925 || data.uid === 141278) {
			return Posts.getPostField(data.post.pid, 'content', function(err, content) {
				if (err) {
					return callback(err, data);
				}

				events.log({
					type: 'fbmac',
					uid: data.uid,
					ip: data.req.ip,
					pid: data.post.pid,
					oldContent: content,
					newContent: data.post.content
				});

				callback(null, data);
			});
		}

		callback(null, data);
	}
};
