<?php

########################################################################
# Extension Manager/Repository config file for ext: "cb_indexedsearch_autocomplete"
#
# Auto generated 26-05-2009 16:48
#
# Manual updates:
# Only the data in the array - anything else is removed by next write.
# "version" and "dependencies" must not be touched!
########################################################################

$EM_CONF[$_EXTKEY] = array(
	'title' => 'Indexed Search AutoComplete',
	'description' => 'Extends the builtin Indexed Search searchform with an autocomplete feature as seen on Google Suggest and a variety of other places. DEMO: http://vinnie.clausbruun.dk',
	'category' => 'fe',
	'shy' => 0,
	'version' => '0.5.0',
	'dependencies' => 'indexed_search',
	'conflicts' => '',
	'priority' => '',
	'loadOrder' => '',
	'module' => '',
	'state' => 'stable',
	'uploadfolder' => 0,
	'createDirs' => '',
	'modify_tables' => '',
	'clearcacheonload' => 0,
	'lockType' => '',
	'author' => 'Claus Bruun',
	'author_email' => 'claus@clausbruun.dk',
	'author_company' => '',
	'CGLcompliance' => '',
	'CGLcompliance_note' => '',
	'constraints' => array(
		'depends' => array(
			'typo3' => '3.8.0-0.0.0',
			'indexed_search' => '',
		),
		'conflicts' => array(
		),
		'suggests' => array(
		),
	),
	'_md5_values_when_last_written' => 'a:12:{s:12:"ext_icon.gif";s:4:"4cf1";s:17:"ext_localconf.php";s:4:"28cc";s:14:"ext_tables.php";s:4:"1af4";s:14:"doc/manual.sxw";s:4:"0a6e";s:17:"img/indicator.gif";s:4:"03ce";s:50:"pi1/class.tx_cb_indexedsearch_autocomplete_pi1.php";s:4:"7acb";s:16:"pi1/fe_index.php";s:4:"0c44";s:37:"res/cb_indexedsearch_autocomplete.css";s:4:"74d9";s:36:"res/cb_indexedsearch_autocomplete.js";s:4:"ef15";s:25:"res/jquery-latest.pack.js";s:4:"9eb3";s:23:"static/ts/constants.txt";s:4:"473f";s:19:"static/ts/setup.txt";s:4:"d333";}',
	'suggests' => array(
	),
);

?>