Party:HB_1
	EXTENDS Offer
		EXPOSES Port:Terminal:work_agreement, // This Port uses :Terminal to express that it's the end goal of the Offer, and that this Offer is a workflow
				Port:expression_of_interest

Party:SP_1
	EXTENDS Offer
		BINDS Port:expression_of_interest
		EXPOSES Port:request_for_quote

Party:HB_1
	EXTENDS Offer
		BINDS Port:request_for_quote
		EXPOSES Port:quote

Party:SP_1
	EXTENDS Offer
		BINDS Port:quote
		EXPOSES Port:counter,
				Port:ref$Terminal:work_agreement

Party:HB_1
	EXTENDS Offer
		BINDS Port:counter
		EXPOSES Port:counter,
				Port:ref$Terminal:work_agreement // This Port references the Terminal port of the workflow. Offers that BIND it implicitly bind the Terminal port

Party:SP_1
	EXTENDS Offer
		BINDS ref$Terminal:work_agreement
