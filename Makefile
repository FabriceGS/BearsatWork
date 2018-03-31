deploy: public/
	scp public/*.html jmccann1@students.brown.edu:www/
	scp public/css/*.css jmccann1@students.brown.edu:www/css/
	scp public/images/*.jpg jmccann1@students.brown.edu:www/images/